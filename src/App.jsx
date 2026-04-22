import React, { useState } from 'react';
import { useTaxiMeter } from './hooks/useTaxiMeter';
import SettingsModal from './components/SettingsModal';
import { Play, Square, Pause, Settings, Globe, Navigation, Clock, Gauge, Signal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const App = () => {
  const [lang, setLang] = useState('ar');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const { 
    status, fare, distance, waitingTime, speed, accuracy, config,
    startTrip, pauseTrip, resumeTrip, stopTrip, resetTrip, saveConfig
  } = useTaxiMeter();

  const isRTL = lang === 'ar';

  const t = {
    ar: {
      title: 'تاكسي ميتر برو',
      fare: 'الأجرة',
      distance: 'المسافة',
      waiting: 'الانتظار',
      speed: 'السرعة',
      accuracy: 'دقة الـ GPS',
      meters: 'متر',
      lowPrecision: 'تحديد الموقع...',
      start: 'ابدأ الرحلة',
      stop: 'إنهاء',
      pause: 'توقف مؤقت',
      resume: 'استئناف',
      reset: 'رحلة جديدة',
      currency: 'جنيه',
      km: 'كم',
      min: 'دقيقة',
      kmh: 'كم/س',
      statusIdle: 'جاهز للبدء',
      statusRunning: 'الرحلة مستمرة',
      statusPaused: 'متوقف مؤقتًا',
      statusFinished: 'انتهت الرحلة',
    },
    en: {
      title: 'Taxi Meter Pro',
      fare: 'Fare',
      distance: 'Distance',
      waiting: 'Waiting',
      speed: 'Speed',
      accuracy: 'GPS Accuracy',
      meters: 'm',
      lowPrecision: 'Locating...',
      start: 'Start Trip',
      stop: 'Finish',
      pause: 'Pause',
      resume: 'Resume',
      reset: 'New Trip',
      currency: 'EGP',
      km: 'km',
      min: 'min',
      kmh: 'km/h',
      statusIdle: 'Ready to Start',
      statusRunning: 'On Trip',
      statusPaused: 'Paused',
      statusFinished: 'Trip Finished',
    }
  }[lang];

  return (
    <div className="app-container" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ padding: '8px', background: 'var(--primary)', borderRadius: '12px' }}>
            <Navigation size={24} color="#000" />
          </div>
          <h1 style={{ fontSize: '1.2rem', fontWeight: '800', letterSpacing: '-0.5px' }}>{t.title}</h1>
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => setIsSettingsOpen(true)}
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: '#fff', padding: '8px', borderRadius: '12px' }}
          >
            <Settings size={20} />
          </button>
          <button 
            onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
            style={{ background: 'none', border: '1px solid var(--border)', color: '#fff', padding: '8px 12px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem' }}
          >
            <Globe size={18} />
            {lang === 'ar' ? 'EN' : 'AR'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '0 20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '20px' }}>
        
        {/* Status Badge */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ 
              padding: '6px 16px', 
              borderRadius: '20px', 
              fontSize: '0.8rem', 
              fontWeight: '600',
              background: status === 'RUNNING' ? 'var(--primary-glow)' : 'rgba(255,255,255,0.05)',
              color: status === 'RUNNING' ? 'var(--primary)' : 'var(--text-secondary)',
              border: `1px solid ${status === 'RUNNING' ? 'var(--primary)' : 'var(--border)'}`
            }}
          >
            {status === 'IDLE' ? t.statusIdle : 
             status === 'RUNNING' ? t.statusRunning : 
             status === 'PAUSED' ? t.statusPaused : t.statusFinished}
          </motion.div>
        </div>

        {/* Fare Display */}
        <div className={`card ${status === 'RUNNING' ? 'active-glow' : ''} ${status === 'FINISHED' ? 'stopped' : ''}`} style={{ textAlign: 'center', padding: '40px 20px' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '2px' }}>
            {t.fare}
          </p>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '10px' }}>
            <span className="digital-fare">{fare.toFixed(2)}</span>
            <span style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', fontWeight: '600' }}>{t.currency}</span>
          </div>
        </div>

        {/* Accuracy Indicator */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
          <Signal size={14} color={accuracy < config.accuracyThreshold ? 'var(--primary)' : 'var(--warning)'} />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            {t.accuracy}: {accuracy ? `${accuracy.toFixed(1)} ${t.meters}` : t.lowPrecision}
          </span>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}>
              <Navigation size={14} /> {t.distance}
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: '800' }}>
              {(distance / 1000).toFixed(2)} <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t.km}</span>
            </div>
          </div>
          <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}>
              <Clock size={14} /> {t.waiting}
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: '800' }}>
              {Math.floor(waitingTime / 60)}:{(waitingTime % 60).toString().padStart(2, '0')} <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t.min}</span>
            </div>
          </div>
        </div>

        {/* Speed Indicator */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)' }}>
          <Gauge size={18} />
          <span style={{ fontSize: '1rem', fontWeight: '600' }}>{speed.toFixed(0)}</span>
          <span style={{ fontSize: '0.8rem' }}>{t.kmh}</span>
        </div>

      </main>

      {/* Controls */}
      <footer style={{ padding: '40px 20px', display: 'flex', justifyContent: 'center', gap: '30px' }}>
        {status === 'IDLE' && (
          <motion.button 
            whileTap={{ scale: 0.9 }}
            className="btn btn-primary" 
            onClick={startTrip}
            style={{ width: '100px', height: '100px', borderRadius: '30px' }}
          >
            <Play size={40} fill="currentColor" />
          </motion.button>
        )}

        {(status === 'RUNNING' || status === 'PAUSED') && (
          <>
            <motion.button 
              whileTap={{ scale: 0.9 }}
              className="btn" 
              onClick={status === 'RUNNING' ? pauseTrip : resumeTrip}
              style={{ background: 'rgba(255,255,255,0.1)', color: '#fff' }}
            >
              {status === 'RUNNING' ? <Pause size={28} /> : <Play size={28} fill="currentColor" />}
            </motion.button>
            
            <motion.button 
              whileTap={{ scale: 0.9 }}
              className="btn btn-danger" 
              onClick={stopTrip}
            >
              <Square size={28} fill="currentColor" />
            </motion.button>
          </>
        )}

        {status === 'FINISHED' && (
          <button 
            className="card" 
            onClick={resetTrip}
            style={{ width: '100%', borderRadius: '20px', padding: '15px', fontWeight: '800', background: 'var(--primary)', color: '#000', border: 'none' }}
          >
            {t.reset}
          </button>
        )}
      </footer>

      {/* Settings Modal */}
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
