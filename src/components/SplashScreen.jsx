import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SplashScreen = ({ isCheckingPermissions }) => {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#0F1012',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}
    >
      {/* Background Decor */}
      <div className="checker-ribbon" style={{ position: 'absolute', top: 0, left: 0 }} />
      <div className="checker-ribbon" style={{ position: 'absolute', bottom: 0, left: 0 }} />
      
      <div style={{ position: 'absolute', width: '300px', height: '300px', background: 'var(--taxi-yellow-soft)', filter: 'blur(100px)', borderRadius: '50%', zIndex: -1 }} />

      {/* Skid Marks Background Effect */}
      <motion.div 
        initial={{ opacity: 0, scaleY: 0 }}
        animate={{ opacity: 0.6, scaleY: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="skid-marks" 
        style={{ bottom: '25%' }} 
      />

      {/* Main Branding - Braking Animation */}
      <div style={{ textAlign: 'center', overflow: 'hidden', padding: '20px', zIndex: 1 }}>
        
        {/* Logo with slight tilt like a moving car */}
        <motion.div
          initial={{ x: 300, opacity: 0, rotate: 10 }}
          animate={{ x: 0, opacity: 1, rotate: 0 }}
          transition={{ 
            type: "spring", 
            stiffness: 100, 
            damping: 10, // "Braking" feel - stops with a slight bounce/jerk
            mass: 0.8
          }}
          style={{ 
            width: '200px', height: '200px', margin: '0 auto 20px', 
            borderRadius: '40px', overflow: 'hidden', 
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            border: '2px solid var(--taxi-yellow)',
            background: '#000'
          }}
        >
          <img src="/logo fair.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </motion.div>

        {/* The Title: FAIR */}
        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          style={{ 
            fontSize: '4rem', fontWeight: '900', letterSpacing: '12px', 
            color: 'var(--taxi-yellow)', textTransform: 'uppercase', marginBottom: '10px'
          }}
        >
          FAIR
        </motion.h1>

        {/* The Slogan: Braking into view */}
        <motion.p
          initial={{ x: -400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ 
            type: "spring", 
            stiffness: 120, // Snappy entry
            damping: 15,    // Sudden stop (brake)
            delay: 0.8 
          }}
          style={{ 
            fontSize: '1.4rem', color: '#fff', fontWeight: '700',
            background: 'rgba(26, 28, 30, 0.8)', padding: '12px 30px', 
            borderRadius: '16px', border: '1px solid var(--glass-border)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
          }}
        >
          اطمّن… الأجرة بقت <span style={{ color: 'var(--taxi-yellow)' }}>Fair</span>
        </motion.p>

      </div>

      {/* Loading Logic */}
      <div style={{ position: 'absolute', bottom: '10%', width: '100%', textAlign: 'center' }}>
        <AnimatePresence mode="wait">
          {isCheckingPermissions ? (
            <motion.p
              key="perm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '500' }}
            >
              جاري التحقق من صلاحيات الموقع (GPS)...
            </motion.p>
          ) : (
            <motion.div
              key="bar"
              initial={{ width: 0 }}
              animate={{ width: '140px' }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              style={{ 
                height: '4px', background: 'var(--taxi-yellow)', 
                margin: '10px auto', borderRadius: '4px',
                boxShadow: '0 0 20px var(--taxi-yellow-glow)'
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default SplashScreen;
