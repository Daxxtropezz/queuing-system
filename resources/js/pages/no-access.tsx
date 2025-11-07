import Box from '@/components/ui/box';
import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert } from 'lucide-react';
import { router, usePage } from '@inertiajs/react';

const GuestAccessDenied = () => {
  const { props } = usePage();
  const appName = props?.appName || import.meta.env.VITE_APP_NAME || '';

  return (
    <Box
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'linear-gradient(to bottom right, #f5f7fa, #e9ecf2)',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        textAlign: 'center',
        padding: '0 16px',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          background: '#ffffff',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
          borderRadius: 16,
          padding: '50px 60px',
          borderTop: '8px solid #c8102e',
          maxWidth: 600,
          width: '100%',
        }}
      >
        {/* Centered Shield Icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#002147',
            width: 80,
            height: 80,
            borderRadius: '50%',
            margin: '0 auto 20px',
            boxShadow: '0 4px 12px rgba(0, 33, 71, 0.3)',
          }}
        >
          <ShieldAlert size={40} color="#ffffff" strokeWidth={1.8} />
        </motion.div>

        <h2
          style={{
            fontSize: 26,
            color: '#002147',
            fontWeight: 700,
            letterSpacing: 0.5,
            textTransform: 'uppercase',
          }}
        >
          {"Access Denied"}
        </h2>

        <p
          style={{
            marginTop: 12,
            fontSize: 16,
            color: '#444',
            lineHeight: 1.6,
            maxWidth: 500,
            marginInline: 'auto',
          }}
        >
          {"You do not have the required permission to access this page. Please contact your administrator for assistance."}
        </p>

        <motion.button
          whileHover={{ scale: 1.05, backgroundColor: '#002147' }}
          whileTap={{ scale: 0.97 }}
          style={{
            marginTop: 30,
            padding: '12px 36px',
            fontSize: 16,
            borderRadius: 8,
            border: 'none',
            background: '#c8102e',
            color: '#ffffff',
            cursor: 'pointer',
            fontWeight: 600,
            letterSpacing: 0.3,
            boxShadow: '0 4px 8px rgba(200, 16, 46, 0.3)',
          }}
          onClick={() => router.visit('/home')}
        >
          Refresh Page
        </motion.button>

        <p
          style={{
            marginTop: 24,
            fontSize: 13,
            color: '#666',
          }}
        >
          {`© ${new Date().getFullYear()} ${appName}. All rights reserved.`}
        </p>
      </motion.div>
    </Box>
  );
};

export default GuestAccessDenied;
