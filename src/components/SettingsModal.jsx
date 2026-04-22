import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Car } from 'lucide-react';

const SettingsModal = ({ isOpen, onClose, config, onSave, lang }) => {
  // Use string-based state for numeric inputs to allow decimals (like "1.")
  const [formData, setFormData] = useState({
    baseFare: config.baseFare.toString(),
    includedDistance: config.includedDistance.toString(),
    kmRate: config.kmRate.toString(),
    waitingRateMinute: config.waitingRateMinute.toString(),
    enableWaitingTime: config.enableWaitingTime
  });

  useEffect(() => {
    setFormData({
      baseFare: config.baseFare.toString(),
      includedDistance: config.includedDistance.toString(),
      kmRate: config.kmRate.toString(),
      waitingRateMinute: config.waitingRateMinute.toString(),
      enableWaitingTime: config.enableWaitingTime
    });
  }, [config]);

  const t = {
    ar: {
      title: 'إعدادات التعريفة',
      baseFare: 'بدء العداد (الفتحة)',
      kmRate: 'سعر الكيلومتر الإضافي',
      includedDistance: 'مسافة مشمولة (متر)',
      waitingRate: 'سعر دقيقة الانتظار',
      enableWaiting: 'تفعيل حساب الانتظار',
      save: 'حفظ الإعدادات',
      currency: 'EGP',
    },
    en: {
      title: 'Tariff Settings',
      baseFare: 'Base Fare (Flag Drop)',
      kmRate: 'Rate per Extra KM',
      includedDistance: 'Included Distance (m)',
      waitingRate: 'Waiting Rate (per min)',
      enableWaiting: 'Enable Waiting Time',
      save: 'Save Config',
      currency: 'EGP',
    }
  }[lang];

  const handleSave = () => {
    onSave({
      baseFare: parseFloat(formData.baseFare) || 0,
      includedDistance: parseInt(formData.includedDistance) || 0,
      kmRate: parseFloat(formData.kmRate) || 0,
      waitingRateMinute: parseFloat(formData.waitingRateMinute) || 0,
      enableWaitingTime: formData.enableWaitingTime
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 100 }}
          />
          <motion.div 
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{ 
              position: 'fixed', bottom: 0, left: 0, right: 0, 
              background: 'var(--bg-card)', borderTop: '2px solid var(--taxi-yellow)',
              borderTopLeftRadius: '32px', borderTopRightRadius: '32px',
              padding: '35px 25px', zIndex: 101, maxHeight: '90vh', overflowY: 'auto',
              boxShadow: '0 -10px 40px rgba(0,0,0,0.5)'
            }}
          >
            {/* Checker Decoration */}
            <div className="checker-ribbon" style={{ position: 'absolute', top: 0, left: 0, height: '4px' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Car color="var(--taxi-yellow)" size={24} />
                <h2 style={{ fontSize: '1.4rem', fontWeight: '900' }}>{t.title}</h2>
              </div>
              <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', padding: '10px', borderRadius: '50%' }}>
                <X size={24} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Numeric Inputs */}
              {[
                { key: 'baseFare', label: t.baseFare },
                { key: 'includedDistance', label: t.includedDistance },
                { key: 'kmRate', label: t.kmRate }
              ].map(field => (
                <div key={field.key}>
                  <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '8px', fontWeight: '700', textTransform: 'uppercase' }}>
                    {field.label}
                  </label>
                  <input 
                    type="text"
                    inputMode="decimal"
                    value={formData[field.key]} 
                    onChange={e => setFormData({...formData, [field.key]: e.target.value})}
                    style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', padding: '18px', borderRadius: '18px', color: '#fff', fontSize: '1.1rem', fontWeight: '600' }}
                  />
                </div>
              ))}

              {/* Waiting Time Switch */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', background: 'rgba(247, 193, 27, 0.05)', borderRadius: '18px', border: '1px solid rgba(247, 193, 27, 0.1)' }}>
                <span style={{ fontWeight: '800' }}>{t.enableWaiting}</span>
                <input 
                  type="checkbox" checked={formData.enableWaitingTime} 
                  onChange={e => setFormData({...formData, enableWaitingTime: e.target.checked})}
                  style={{ width: '28px', height: '28px', accentColor: 'var(--taxi-yellow)' }}
                />
              </div>

              {formData.enableWaitingTime && (
                <div style={{ marginTop: '10px' }}>
                  <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '8px', fontWeight: '700', textTransform: 'uppercase' }}>
                    {t.waitingRate}
                  </label>
                  <input 
                    type="text"
                    inputMode="decimal"
                    value={formData.waitingRateMinute} 
                    onChange={e => setFormData({...formData, waitingRateMinute: e.target.value})}
                    style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', padding: '18px', borderRadius: '18px', color: '#fff', fontSize: '1.1rem', fontWeight: '600' }}
                  />
                </div>
              )}

              <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={handleSave}
                className="action-btn action-btn-main"
                style={{ width: '100%', height: '70px', marginTop: '10px', fontSize: '1.1rem' }}
              >
                <Save size={20} style={{ marginRight: '10px' }} /> {t.save}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SettingsModal;
