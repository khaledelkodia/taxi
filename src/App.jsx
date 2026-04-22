import React, { useState, useEffect } from 'react';
import { useTaxiMeter } from './hooks/useTaxiMeter';
import SettingsModal from './components/SettingsModal';
import SplashScreen from './components/SplashScreen';
import { Geolocation } from '@capacitor/geolocation';
import { StatusBar } from '@capacitor/status-bar';
import { Play, Square, Pause, Settings, Globe, Navigation, Clock, Gauge, Signal, Car } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const App = () => {
  const [lang, setLang] = useState('ar');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [isPermGranted, setIsPermGranted] = useState(false);
  
  const { 
    status, fare, distance, waitingTime, speed, accuracy, config,
    startTrip, pauseTrip, resumeTrip, stopTrip, resetTrip, saveConfig
  } = useTaxiMeter();

  useEffect(() => {
    // Hide status bar for immersive experience
    const initApp = async () => {
      try {
        await StatusBar.hide();
      } catch (e) {
        console.log('StatusBar not available in this environment');
      }
    };
    initApp();

    const checkPermissions = async () => {
      const startTime = Date.now();
      
      try {
        const initialPerm = await Geolocation.checkPermissions();
        if (initialPerm.location !== 'granted') {
          await Geolocation.requestPermissions();
        }
      } catch (e) { console.error('Permission prompt error', e); }

      const checkAndHide = async () => {
         try {
           const perm = await Geolocation.checkPermissions();
           if (perm.location === 'granted') {
             setIsPermGranted(true);
             const elapsed = Date.now() - startTime;
             const remaining = Math.max(0, 3000 - elapsed);
             setTimeout(() => setShowSplash(false), remaining);
           } else {
             setTimeout(checkAndHide, 500);
           }
         } catch (e) {
             setTimeout(checkAndHide, 500);
         }
      };
      
      checkAndHide();
    };
    
    checkPermissions();
  }, []);

  const isRTL = lang === 'ar';

  const t = {
    ar: {
      title: 'FAIR',
      subtitle: 'اطمّن... الأجرة بقت فير',
      fareLabel: 'إجمالي الأجرة',
      distance: 'المسافة',
      waiting: 'الانتظار',
      speed: 'السرعة',
      accuracy: 'دقة الموقع',
      meters: 'م',
      locating: 'جاري التحديد...',
      start: 'بدء الرحلة',
      stop: 'إنهاء',
      pause: 'توقف',
      resume: 'متابعة',
      reset: 'رحلة جديدة',
    },
    en: {
      title: 'FAIR',
      subtitle: 'Stay safe… the fare is Fair',
      fareLabel: 'Total Fare',
      distance: 'Distance',
      waiting: 'Waiting',
      speed: 'Speed',
      accuracy: 'GPS Accuracy',
      meters: 'm',
      locating: 'Locating...',
      start: 'Start Trip',
      stop: 'Finish',
      pause: 'Pause',
      resume: 'Resume',
      reset: 'New Trip',
    }
  }[lang];

  return (
    <div className="app-container" dir={isRTL ? 'rtl' : 'ltr'}>
      <AnimatePresence>
        {showSplash && <SplashScreen isCheckingPermissions={!isPermGranted} />}
      </AnimatePresence>

      <div className="bg-glow" />
      
      {/* Top Checker Ribbon */}
      <div className="checker-ribbon" />

      {/* Header */}
      <header style={{ padding: '30px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <motion.div 
            whileHover={{ rotate: 15 }}
            style={{ 
              width: '48px', height: '48px', overflow: 'hidden',
              borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 20px var(--primary-gold-glow)'
            }}
          >
            <img src="/logo fair.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </motion.div>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: '800', letterSpacing: '1px', color: 'var(--taxi-yellow)' }}>{t.title}</h1>
            <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>{t.subtitle}</p>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => setIsSettingsOpen(true)} className="action-btn" style={{ width: '42px', height: '42px' }}>
            <Settings size={20} />
          </motion.button>
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')} className="action-btn" style={{ padding: '0 12px', height: '42px', fontSize: '0.8rem', gap: '5px' }}>
            <Globe size={16} color="var(--taxi-yellow)" />
            {lang === 'ar' ? 'EN' : 'AR'}
          </motion.button>
        </div>
      </header>

      {/* Main Dash */}
      <main style={{ flex: 1, padding: '0 20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '20px' }}>
        
        {/* Central Fare Card */}
        <motion.div 
          layout
          className={`taxi-card ${status === 'RUNNING' ? 'active' : ''}`}
          style={{ padding: '40px 20px', textAlign: 'center' }}
        >
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '3px' }}>
            {t.fareLabel}
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '10px', marginTop: '10px' }}>
            <span className="digital-unit" style={{ fontSize: '5.5rem', fontWeight: '800' }}>
              {fare.toFixed(2)}
            </span>
            <span style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--taxi-yellow)' }}>EGP</span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '20px' }}>
            <Signal size={12} color={accuracy < config.accuracyThreshold ? 'var(--taxi-yellow)' : '#F59E0B'} />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {t.accuracy}: {accuracy ? `${accuracy.toFixed(1)}${t.meters}` : t.locating}
            </span>
          </div>
        </motion.div>

        {/* Secondary Info Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div className="taxi-card" style={{ padding: '20px' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Navigation size={14} color="var(--taxi-yellow)" /> {t.distance}
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: '800' }}>
              {(distance / 1000).toFixed(2)} <span style={{ fontSize: '0.75rem' }}>KM</span>
            </div>
          </div>
          <div className="taxi-card" style={{ padding: '20px' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={14} color="var(--taxi-yellow)" /> {t.waiting}
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: '800' }}>
              {Math.floor(waitingTime / 60)}:{(waitingTime % 60).toString().padStart(2, '0')} <span style={{ fontSize: '0.75rem' }}>m</span>
            </div>
          </div>
        </div>

        {/* Dynamic Speed Meter */}
        <div style={{ padding: '10px 5px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
             <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '700' }}>{t.speed}</span>
             <span style={{ fontSize: '0.8rem', fontWeight: '800' }}>{speed.toFixed(0)} KM/H</span>
          </div>
          <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
            <motion.div 
              animate={{ width: `${Math.min(100, (speed / 120) * 100)}%` }}
              style={{ height: '100%', background: 'var(--taxi-yellow)', boxShadow: '0 0 10px var(--taxi-yellow-glow)' }}
            />
          </div>
        </div>

      </main>

      {/* Main Controls - Comfort Layout */}
      <footer style={{ padding: '40px 20px 40px', background: 'rgba(15,16,18,0.8)', backdropFilter: 'blur(10px)' }}>
        <AnimatePresence mode="wait">
          {status === 'IDLE' && (
            <motion.button 
              key="start" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
              whileTap={{ scale: 0.95 }} onClick={startTrip}
              className="action-btn action-btn-main"
              style={{ width: '100%', height: '70px', fontSize: '1.2rem', gap: '12px' }}
            >
              <Play size={24} fill="currentColor" /> {t.start}
            </motion.button>
          )}

          {(status === 'RUNNING' || status === 'PAUSED') && (
            <motion.div 
              key="on-trip" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            >
              {status === 'RUNNING' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <motion.button 
                    whileTap={{ scale: 0.95 }}
                    onClick={pauseTrip}
                    className="action-btn"
                    style={{ height: '70px', borderRadius: '22px', fontSize: '1.1rem', background: 'rgba(255,255,255,0.05)' }}
                  >
                    <Pause size={24} style={{ marginBottom: '5px' }} />
                    <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800' }}>{t.pause}</span>
                  </motion.button>
                  <motion.button 
                    whileTap={{ scale: 0.95 }} 
                    onClick={() => stopTrip(lang)}
                    className="action-btn"
                    style={{ height: '70px', borderRadius: '22px', fontSize: '1.1rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' }}
                  >
                    <Square size={24} style={{ marginBottom: '5px' }} />
                    <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800' }}>{t.stop}</span>
                  </motion.button>
                </div>
              )}
              {status === 'PAUSED' && (
                <motion.button 
                  whileTap={{ scale: 0.95 }} onClick={resumeTrip}
                  className="action-btn action-btn-main"
                  style={{ width: '100%', height: '70px', fontSize: '1.2rem', gap: '12px' }}
                >
                  <Play size={24} fill="currentColor" /> {t.resume}
                </motion.button>
              )}
            </motion.div>
          )}

          {status === 'FINISHED' && (
            <motion.button 
              key="reset" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              whileTap={{ scale: 0.95 }} onClick={resetTrip}
              className="action-btn action-btn-main"
              style={{ width: '100%', height: '70px', fontSize: '1.2rem' }}
            >
              {t.reset}
            </motion.button>
          )}
        </AnimatePresence>
      </footer>

      {/* Bottom Checker Ribbon */}
      <div className="checker-ribbon" />

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onSave={saveConfig}
        lang={lang}
      />
    </div>
  );
};

export default App;
