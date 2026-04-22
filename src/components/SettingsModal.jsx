import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, RotateCcw, Info } from 'lucide-react';

const SettingsModal = ({ isOpen, onClose, config, onSave, lang }) => {
  const [localConfig, setLocalConfig] = useState(config);

  const t = {
    ar: {
      title: 'إعدادات التعريفة',
      baseFare: 'بدء العداد (الفتحة)',
      kmRate: 'سعر الكيلومتر',
      waitingRate: 'سعر دقيقة الانتظار',
      enableWaiting: 'تفعيل حساب الانتظار',
      accuracy: 'دقة الـ GPS المطلوبة (متر)',
      save: 'حفظ الإعدادات',
      reset: 'إعادة الافتراضي',
      currency: 'جنيه',
    },
    en: {
      title: 'Tariff Settings',
      baseFare: 'Base Fare (Flag Drop)',
      kmRate: 'Rate per KM',
      waitingRate: 'Waiting Rate (per min)',
      enableWaiting: 'Enable Waiting Time',
      accuracy: 'Required Accuracy (meters)',
      save: 'Save Settings',
      reset: 'Reset Defaults',
      currency: 'EGP',
    }
  }[lang];

  const handleSave = () => {
    onSave(localConfig);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', zIndex: 100 }}
          />
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{ 
              position: 'fixed', bottom: 0, left: 0, right: 0, 
              background: '#121212', borderTop: '1px solid var(--border)',
              borderTopLeftRadius: '32px', borderTopRightRadius: '32px',
              padding: '30px 20px', zIndex: 101, maxH: '90vh', overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>{t.title}</h2>
              <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '10px', borderRadius: '50%' }}>
                <X size={24} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Base Fare */}
              <div className="input-group">
                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '8px' }}>{t.baseFare}</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="number" 
                    value={localConfig.baseFare} 
                    onChange={e => setLocalConfig({...localConfig, baseFare: parseFloat(e.target.value)})}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', padding: '15px', borderRadius: '15px', color: '#fff', fontSize: '1.1rem' }}
                  />
                  <span style={{ position: 'absolute', right: lang === 'en' ? '15px' : 'auto', left: lang === 'ar' ? '15px' : 'auto', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}>{t.currency}</span>
                </div>
              </div>

              {/* KM Rate */}
              <div className="input-group">
                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '8px' }}>{t.kmRate}</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="number" 
                    value={localConfig.kmRate} 
                    onChange={e => setLocalConfig({...localConfig, kmRate: parseFloat(e.target.value)})}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', padding: '15px', borderRadius: '15px', color: '#fff', fontSize: '1.1rem' }}
                  />
                </div>
              </div>

              {/* Waiting Toggle */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: 'rgba(255,255,255,0.03)', borderRadius: '15px' }}>
                <div>
                  <span style={{ display: 'block', fontWeight: '600' }}>{t.enableWaiting}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>تبدأ عند سرعة أقل من {localConfig.speedThreshold} كم/س</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={localConfig.enableWaitingTime} 
                  onChange={e => setLocalConfig({...localConfig, enableWaitingTime: e.target.checked})}
                  style={{ width: '24px', height: '24px', accentColor: 'var(--primary)' }}
                />
              </div>

              {localConfig.enableWaitingTime && (
                <div className="input-group">
                  <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '8px' }}>{t.waitingRate}</label>
                  <input 
                    type="number" 
                    value={localConfig.waitingRateMinute} 
                    onChange={e => setLocalConfig({...localConfig, waitingRateMinute: parseFloat(e.target.value)})}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', padding: '15px', borderRadius: '15px', color: '#fff', fontSize: '1.1rem' }}
                  />
                </div>
              )}

              {/* Accuracy Threshold */}
              <div className="input-group">
                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '8px' }}>{t.accuracy}</label>
                <input 
                  type="number" 
                  value={localConfig.accuracyThreshold} 
                  onChange={e => setLocalConfig({...localConfig, accuracyThreshold: parseInt(e.target.value)})}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', padding: '15px', borderRadius: '15px', color: '#fff', fontSize: '1.1rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
                <button 
                  onClick={handleSave}
                  style={{ flex: 1, background: 'var(--primary)', color: '#000', border: 'none', padding: '18px', borderRadius: '15px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                >
                  <Save size={20} /> {t.save}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SettingsModal;
