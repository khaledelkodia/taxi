import { useState, useEffect, useRef, useCallback } from 'react';
import { Geolocation } from '@capacitor/geolocation';
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import * as geolib from 'geolib';

const TRIP_STATUS = {
  IDLE: 'IDLE',
  RUNNING: 'RUNNING',
  PAUSED: 'PAUSED',
  FINISHED: 'FINISHED',
};

// Default rates (Standard Egypt Example)
const DEFAULT_RATES = {
  baseFare: 8.5,
  kmRate: 4.0,
  waitingRateMinute: 1.0, // 60 EGP per hour = 1 EGP per min
  speedThreshold: 10, // km/h (below this we charge waiting time)
};

export const useTaxiMeter = (config = DEFAULT_RATES) => {
  const [status, setStatus] = useState(TRIP_STATUS.IDLE);
  const [fare, setFare] = useState(0);
  const [distance, setDistance] = useState(0); // in meters
  const [waitingTime, setWaitingTime] = useState(0); // in seconds
  const [speed, setSpeed] = useState(0); // in km/h
  const [startTime, setStartTime] = useState(null);
  
  const watchId = useRef(null);
  const lastPosition = useRef(null);
  const timerRef = useRef(null);
  const lastUpdateTime = useRef(null);

  // Background Geolocation would require a community plugin for full background support
  // For this implementation, we use standard Geolocation with high accuracy
  
  const statusRef = useRef(status);
  useEffect(() => { statusRef.current = status; }, [status]);

  const announceFare = async (amount) => {
    try {
      console.log('Announcing fare:', amount);
      const text = `Total fare is ${amount.toFixed(2)} pounds`;
      await TextToSpeech.speak({
        text,
        lang: 'en-US',
        rate: 1.0,
        pitch: 1.0,
        volume: 1.0,
        category: 'ambient',
      });
    } catch (e) {
      console.error('Speech error', e);
    }
  };

  const startTrip = useCallback(async () => {
    console.log('Attempting to start trip...');
    try {
      const perm = await Geolocation.requestPermissions();
      console.log('Permission status:', perm);
      
      if (perm.location === 'denied') {
        alert('Location permission is denied. Please enable it to use the taxi meter.');
        return;
      }

      setFare(config.baseFare);
      setDistance(0);
      setWaitingTime(0);
      setStartTime(Date.now());
      setStatus(TRIP_STATUS.RUNNING);
      lastUpdateTime.current = Date.now();

      console.log('Starting watchPosition...');
      watchId.current = await Geolocation.watchPosition(
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
        (position, err) => {
          if (err) {
            console.error('Watch error:', err);
            return;
          }
          if (!position) {
            console.log('No position received');
            return;
          }

          console.log('Position received:', position.coords.latitude, position.coords.longitude);
          const { latitude, longitude, speed: currentSpeedMs } = position.coords;
          const currentSpeedKmh = (currentSpeedMs || 0) * 3.6;
          setSpeed(currentSpeedKmh);

          if (lastPosition.current) {
            const dist = geolib.getDistance(
              { latitude: lastPosition.current.latitude, longitude: lastPosition.current.longitude },
              { latitude, longitude },
              1
            );
            console.log('Distance delta:', dist, 'meters');

            if (currentSpeedKmh > config.speedThreshold) {
              setDistance(prev => {
                const newDist = prev + dist;
                setFare(f => f + (dist / 1000) * config.kmRate);
                return newDist;
              });
            }
          }
          lastPosition.current = { latitude, longitude };
        }
      );

      console.log('Starting timer...');
      timerRef.current = setInterval(() => {
        if (statusRef.current === TRIP_STATUS.RUNNING) {
          setSpeed(s => {
            if (s <= config.speedThreshold) {
              setWaitingTime(prev => {
                const newWait = prev + 1;
                setFare(f => f + (config.waitingRateMinute / 60));
                return newWait;
              });
            }
            return s;
          });
        }
      }, 1000);
    } catch (error) {
      console.error('Failed to start trip:', error);
      alert('Error starting GPS: ' + error.message);
    }
  }, [config]);

  const pauseTrip = () => {
    setStatus(TRIP_STATUS.PAUSED);
  };

  const resumeTrip = () => {
    setStatus(TRIP_STATUS.RUNNING);
  };

  const stopTrip = async () => {
    if (watchId.current) {
      Geolocation.clearWatch({ id: watchId.current });
      watchId.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setStatus(TRIP_STATUS.FINISHED);
    await announceFare(fare);
  };

  const resetTrip = () => {
    setStatus(TRIP_STATUS.IDLE);
    setFare(0);
    setDistance(0);
    setWaitingTime(0);
    setSpeed(0);
    lastPosition.current = null;
  };

  return {
    status,
    fare,
    distance,
    waitingTime,
    speed,
    startTrip,
    pauseTrip,
    resumeTrip,
    stopTrip,
    resetTrip,
  };
};
