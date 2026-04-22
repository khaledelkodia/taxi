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
  baseFare: 15.0, // EGP
  kmRate: 4.0, // EGP
  waitingRateMinute: 0.53, // ~32 EGP per hour
  includedDistance: 1000, // 1000m (1km) included in base fare
  enableWaitingTime: true,
  speedThreshold: 5,
  accuracyThreshold: 30,
  minMoveThreshold: 2,
};

export const useTaxiMeter = () => {
  const [status, setStatus] = useState(TRIP_STATUS.IDLE);
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [fare, setFare] = useState(0);
  const [distance, setDistance] = useState(0);
  const [waitingTime, setWaitingTime] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [accuracy, setAccuracy] = useState(null);
  
  const statusRef = useRef(status);
  const configRef = useRef(config);
  const distanceRef = useRef(distance);
  const waitingTimeRef = useRef(waitingTime);
  const hasMoved = useRef(false); // New: Track if movement has started
  const watchId = useRef(null);
  const lastPosition = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => { statusRef.current = status; }, [status]);
  useEffect(() => { configRef.current = config; }, [config]);
  useEffect(() => { distanceRef.current = distance; }, [distance]);
  useEffect(() => { waitingTimeRef.current = waitingTime; }, [waitingTime]);

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

  const calculateCurrentFare = (totalDist, waitTimeSecs, cfg) => {
    let newFare = cfg.baseFare;
    if (totalDist > cfg.includedDistance) {
      newFare += ((totalDist - cfg.includedDistance) / 1000) * cfg.kmRate;
    }
    if (cfg.enableWaitingTime) {
      newFare += (waitTimeSecs / 60) * cfg.waitingRateMinute;
    }
    return newFare;
  };

  const announceFare = async (amount, lang = 'ar') => {
    try {
      const isAr = lang === 'ar';
      const roundedFare = Math.round(amount);
      const text = isAr 
        ? `تم انتهاء الرحلة. إجمالي الأجرة هو ${roundedFare} جنيه.`
        : `Trip finished. The total fare is ${roundedFare} pounds.`;
      
      await TextToSpeech.speak({ 
        text, 
        lang: isAr ? 'ar-SA' : 'en-US',
        rate: 0.9 
      });
    } catch (e) { console.error('Speech error', e); }
  };

  const startTrip = useCallback(async () => {
    try {
      const perm = await Geolocation.requestPermissions();
      if (perm.location === 'denied') {
        alert('Please enable location.');
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
          if (acc > configRef.current.accuracyThreshold) return;

          const currentSpeedKmH = (sMs || 0) * 3.6;
          setSpeed(currentSpeedKmH);

          // If speed is above threshold, mark as moved
          if (currentSpeedKmH > configRef.current.minMoveThreshold) {
            hasMoved.current = true;
          }

          if (lastPosition.current) {
            const dist = geolib.getDistance(
              { latitude: lastPosition.current.latitude, longitude: lastPosition.current.longitude },
              { latitude, longitude },
              1
            );

            if (dist > configRef.current.minMoveThreshold) {
              hasMoved.current = true; // Also mark as moved if distance logic triggers
              setDistance(prev => {
                const newDist = prev + dist;
                setFare(calculateCurrentFare(newDist, waitingTimeRef.current, configRef.current));
                return newDist;
              });
              lastPosition.current = { latitude, longitude };
            }
          } else {
            lastPosition.current = { latitude, longitude };
          }
        }
      );

      timerRef.current = setInterval(() => {
        if (statusRef.current === TRIP_STATUS.RUNNING) {
          setSpeed(s => {
            // ONLY accumulate waiting time if:
            // 1. Waiting is enabled in config
            // 2. Speed is low
            // 3. AND the car has actually moved at least once (to prevent charging before start)
            if (configRef.current.enableWaitingTime && s <= configRef.current.speedThreshold && hasMoved.current) {
              setWaitingTime(prev => {
                const newWait = prev + 1;
                setFare(calculateCurrentFare(distanceRef.current, newWait, configRef.current));
                return newWait;
              });
            }
            return s;
          });
        }
      }, 1000);
    } catch (error) { alert('GPS Error: ' + error.message); }
  }, []);

  const stopTrip = async (lang = 'ar') => {
    if (watchId.current) Geolocation.clearWatch({ id: watchId.current });
    if (timerRef.current) clearInterval(timerRef.current);
    setStatus(TRIP_STATUS.FINISHED);
    await announceFare(fare, lang);
  };

  return {
    status, fare, distance, waitingTime, speed, accuracy, config,
    startTrip, pauseTrip: () => setStatus(TRIP_STATUS.PAUSED),
    resumeTrip: () => setStatus(TRIP_STATUS.RUNNING),
    stopTrip, resetTrip: () => {
      setStatus(TRIP_STATUS.IDLE); setFare(0); setDistance(0); 
      setWaitingTime(0); setSpeed(0); setAccuracy(null);
      hasMoved.current = false; // Reset movement flag
    },
    saveConfig
  };
};
