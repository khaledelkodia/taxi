import { useState, useEffect, useRef, useCallback } from 'react';
import { Geolocation } from '@capacitor/geolocation';
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { Preferences } from '@capacitor/preferences';
import * as geolib from 'geolib';

const TRIP_STATUS = {
  IDLE: 'IDLE',
  RUNNING: 'RUNNING',
  PAUSED: 'PAUSED',
  FINISHED: 'FINISHED',
};

export const DEFAULT_CONFIG = {
  baseFare: 10.0,
  kmRate: 5.0,
  waitingRateMinute: 1.0,
  enableWaitingTime: false, // User requested distance-based primarily
  speedThreshold: 5, // km/h
  accuracyThreshold: 30, // meters (ignore points worse than this)
  minMoveThreshold: 2, // meters (ignore tiny jumps)
};

export const useTaxiMeter = () => {
  const [status, setStatus] = useState(TRIP_STATUS.IDLE);
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [fare, setFare] = useState(0);
  const [distance, setDistance] = useState(0);
  const [waitingTime, setWaitingTime] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [accuracy, setAccuracy] = useState(null); // GPS accuracy in meters
  
  const statusRef = useRef(status);
  const configRef = useRef(config);
  const watchId = useRef(null);
  const lastPosition = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => { statusRef.current = status; }, [status]);
  useEffect(() => { configRef.current = config; }, [config]);

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      const { value } = await Preferences.get({ key: 'taxi_meter_config' });
      if (value) {
        setConfig(JSON.parse(value));
      }
    };
    loadSettings();
  }, []);

  const saveConfig = async (newConfig) => {
    setConfig(newConfig);
    await Preferences.set({
      key: 'taxi_meter_config',
      value: JSON.stringify(newConfig),
    });
  };

  const announceFare = async (amount) => {
    try {
      console.log('Announcing fare:', amount);
      const text = `The total fare is ${amount.toFixed(0)} pounds`;
      await TextToSpeech.speak({ text, lang: 'en-US' });
    } catch (e) { console.error('Speech error', e); }
  };

  const startTrip = useCallback(async () => {
    try {
      const perm = await Geolocation.requestPermissions();
      if (perm.location === 'denied') {
        alert('Please enable location to use the meter.');
        return;
      }

      setFare(configRef.current.baseFare);
      setDistance(0);
      setWaitingTime(0);
      setStatus(TRIP_STATUS.RUNNING);
      lastPosition.current = null;

      watchId.current = await Geolocation.watchPosition(
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
        (position, err) => {
          if (err || !position) return;

          const { latitude, longitude, speed: sMs, accuracy: acc } = position.coords;
          setAccuracy(acc);

          // Jitter Filtering: Ignore points with poor accuracy
          if (acc > configRef.current.accuracyThreshold) {
            console.log('Skipping point due to low accuracy:', acc);
            return;
          }

          const currentSpeedKmh = (sMs || 0) * 3.6;
          setSpeed(currentSpeedKmh);

          if (lastPosition.current) {
            const dist = geolib.getDistance(
              { latitude: lastPosition.current.latitude, longitude: lastPosition.current.longitude },
              { latitude, longitude },
              1
            );

            // Jitter Filtering: Ignore tiny jumps
            if (dist > configRef.current.minMoveThreshold) {
              setDistance(prev => {
                const newDist = prev + dist;
                // Update fare based on distance (km)
                setFare(f => f + (dist / 1000) * configRef.current.kmRate);
                return newDist;
              });
              lastPosition.current = { latitude, longitude };
            }
          } else {
            lastPosition.current = { latitude, longitude };
          }
        }
      );

      // Timer for waiting time (only if enabled)
      timerRef.current = setInterval(() => {
        if (statusRef.current === TRIP_STATUS.RUNNING && configRef.current.enableWaitingTime) {
          setSpeed(s => {
            if (s <= configRef.current.speedThreshold) {
              setWaitingTime(prev => {
                const newWait = prev + 1;
                setFare(f => f + (configRef.current.waitingRateMinute / 60));
                return newWait;
              });
            }
            return s;
          });
        }
      }, 1000);
    } catch (error) {
      alert('GPS Error: ' + error.message);
    }
  }, []);

  const pauseTrip = () => setStatus(TRIP_STATUS.PAUSED);
  const resumeTrip = () => setStatus(TRIP_STATUS.RUNNING);

  const stopTrip = async () => {
    if (watchId.current) Geolocation.clearWatch({ id: watchId.current });
    if (timerRef.current) clearInterval(timerRef.current);
    setStatus(TRIP_STATUS.FINISHED);
    await announceFare(fare);
  };

  const resetTrip = () => {
    setStatus(TRIP_STATUS.IDLE);
    setFare(0);
    setDistance(0);
    setWaitingTime(0);
    setSpeed(0);
    setAccuracy(null);
  };

  return {
    status, fare, distance, waitingTime, speed, accuracy, config,
    startTrip, pauseTrip, resumeTrip, stopTrip, resetTrip, saveConfig
  };
};
