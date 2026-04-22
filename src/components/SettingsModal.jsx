import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, RotateCcw } from 'lucide-react';

const SettingsModal = ({ isOpen, onClose, config, onSave, lang }) => {
  const [localConfig, setLocalConfig] = useState(config);

  const t = {
    ar: {
      title: 'إعدادات التعريفة',
      baseFare: 'بدء العداد (الفتحة)',
      kmRate: 'سعر الكيلومتر الإضافي',
      includedDistance: 'مسافة مشمولة في الفتحة (متر)',
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
      kmRate: 'Rate per Extra KM',
      includedDistance: 'Distance included in Base Fare (m)',
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
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', zIndex: 100 }}
          />
          <motion.div 
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{ 
              position: 'fixed', bottom: 0, left: 0, right: 0, 
              background: '#121212', borderTop: '1px solid var(--border)',
              borderTopLeftRadius: '32px', borderTopRightRadius: '32px',
              padding: '30px 20px', zIndex: 101, maxHeight: '90vh', overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>{t.title}</h2>
              <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '10px', borderRadius: '50%' }}>
                <X size={24} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="input-group">
                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '8px' }}>{t.baseFare}</label>
                <input 
                  type="number" value={localConfig.baseFare} 
                  onChange={e => setLocalConfig({...localConfig, baseFare: parseFloat(e.target.value)})}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', padding: '15px', borderRadius: '15px', color: '#fff' }}
                />
              </div>

              <div className="input-group">
                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '8px' }}>{t.includedDistance}</label>
                <input 
                  type="number" value={localConfig.includedDistance} 
                  onChange={e => setLocalConfig({...localConfig, includedDistance: parseInt(e.target.value)})}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', padding: '15px', borderRadius: '15px', color: '#fff' }}
                />
              </div>

              <div className="input-group">
                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '8px' }}>{t.kmRate}</label>
                <input 
                  type="number" value={localConfig.kmRate} 
                  onChange={e => setLocalConfig({...localConfig, kmRate: parseFloat(e.target.value)})}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', padding: '15px', borderRadius: '15px', color: '#fff' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: 'rgba(255,255,255,0.03)', borderRadius: '15px' }}>
                <span style={{ fontWeight: '600' }}>{t.enableWaiting}</span>
                <input 
                  type="checkbox" checked={localConfig.enableWaitingTime} 
                  onChange={e => setLocalConfig({...localConfig, enableWaitingTime: e.target.checked})}
                  style={{ width: '24px', height: '24px', accentColor: 'var(--primary)' }}
                />
              </div>

              {localConfig.enableWaitingTime && (
                <div className="input-group">
                  <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '8px' }}>{t.waitingRate}</label>
                  <input 
                    type="number" value={localConfig.waitingRateMinute} 
                    onChange={e => setLocalConfig({...localConfig, waitingRateMinute: parseFloat(e.target.value)})}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', padding: '15px', borderRadius: '15px', color: '#fff' }}
                  />
                </div>
              )}

              <button 
                onClick={handleSave}
                style={{ width: '100%', background: 'var(--primary)', color: '#000', border: 'none', padding: '18px', borderRadius: '15px', fontWeight: '800', marginTop: '10px' }}
              >
                {t.save}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SettingsModal;
