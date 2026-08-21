/**
 * WorkOS AuthKit - Embedded SSO Sign-in
 * 
 * This component provides an embedded SSO sign-in form
 * that stays within the HRMS application.
 * 
 * No redirect to WorkOS - users sign in directly in the app.
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Business as BusinessIcon
} from '@mui/icons-material';

const SSOEmbed = ({ onSSOSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ssoConfig, setSSOConfig] = useState(null);
  const [step, setStep] = useState('email'); // 'email' or 'password'

  // Detect SSO domain when email changes
  useEffect(() => {
    const detectSSO = async () => {
      if (email.includes('@')) {
        const domain = email.split('@')[1];
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/sso/check-domain`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ domain })
          });
          
          const data = await response.json();
          
          if (data.hasSSO) {
            setSSOConfig(data.config);
            setError('');
          } else {
            setSSOConfig(null);
          }
        } catch (err) {
          // Silently fail - not all domains have SSO
          setSSOConfig(null);
        }
      }
    };

    const timer = setTimeout(detectSSO, 500);
    return () => clearTimeout(timer);
  }, [email]);

  const handleContinue = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Initiate SSO login
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/sso/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (data.success && data.authorizationUrl) {
        // Store state for verification
        if (data.state) {
          sessionStorage.setItem('sso_state', data.state);
          localStorage.setItem('sso_email', email);
        }

        // For embedded flow, we'll use popup or iframe
        // Option 1: Open in popup
        const width = 600;
        const height = 700;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;
        
        const popup = window.open(
          data.authorizationUrl,
          'SSOSignIn',
          `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,location=no,status=no`
        );

        // Listen for callback
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed);
            
            // Check if authentication was successful
            const token = localStorage.getItem('sso_token');
            if (token) {
              onSSOSuccess({ token, email });
            } else {
              setLoading(false);
            }
          }
        }, 500);
      } else {
        setError(data.message || 'Failed to initiate SSO login');
        setLoading(false);
      }
    } catch (err) {
      console.error('SSO Error:', err);
      setError('Failed to connect to SSO. Please try again.');
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleContinue();
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 4,
        maxWidth: 450,
        mx: 'auto',
        borderRadius: 2
      }}
    >
      <Box sx={{ mb: 3, textAlign: 'center' }}>
        <BusinessIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
        <Typography variant="h5" gutterBottom fontWeight="bold">
          Enterprise SSO Sign-in
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Sign in with your company credentials
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {ssoConfig && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            ✅ SSO detected for <strong>{ssoConfig.provider || 'your organization'}</strong>
          </Typography>
        </Alert>
      )}

      <TextField
        fullWidth
        label="Work Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyPress={handleKeyPress}
        disabled={loading}
        margin="normal"
        placeholder="you@company.com"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <EmailIcon color="action" />
            </InputAdornment>
          )
        }}
        helperText="Enter your company email address"
      />

      <Button
        fullWidth
        variant="contained"
        size="large"
        onClick={handleContinue}
        disabled={loading || !email}
        sx={{
          mt: 3,
          mb: 2,
          py: 1.5,
          fontSize: '1rem',
          fontWeight: 'bold'
        }}
      >
        {loading ? (
          <CircularProgress size={24} color="inherit" />
        ) : (
          'Continue with SSO'
        )}
      </Button>

      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          You'll be redirected to your company's login page
        </Typography>
      </Box>
    </Paper>
  );
};

export default SSOEmbed;
