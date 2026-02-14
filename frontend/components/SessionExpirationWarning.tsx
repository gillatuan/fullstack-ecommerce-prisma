'use client'

import { useTokenExpiration } from 'app/auth/useTokenExpiration';
import { Button, Box, Alert } from '@mui/material';
import { useRouter } from 'next/navigation';

/**
 * SessionExpirationWarning Component
 * 
 * Shows warning banner when session is expiring soon
 * Provides option to extend session or logout
 * 
 * Usage:
 * ```
 * <SessionExpirationWarning />
 * ```
 */
export default function SessionExpirationWarning() {
  const router = useRouter();
  const { status, secondsRemaining } = useTokenExpiration({
    warningThreshold: 300,  // Warn 5 minutes before expiration
  });

  if (status === 'valid') {
    return null;  // No warning needed
  }

  const formatTime = (seconds: number | null) => {
    if (seconds === null) return 'now';
    if (seconds < 0) return 'expired';
    
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  };

  if (status === 'expired') {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        ❌ <strong>Session Expired</strong><br/>
        Your authentication token has expired. Please login again.
        <Box sx={{ mt: 1 }}>
          <Button
            variant="contained"
            size="small"
            onClick={() => router.push('/auth/login')}
          >
            Go to Login
          </Button>
        </Box>
      </Alert>
    );
  }

  if (status === 'expiring-soon') {
    return (
      <Alert severity="warning" sx={{ mb: 2 }}>
        ⏰ <strong>Session Expiring Soon</strong><br/>
        Your session will expire in {formatTime(secondsRemaining)}.
        <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            size="small"
            color="warning"
            onClick={() => {
              // Refresh page to extend session via auto-refresh
              window.location.reload();
            }}
          >
            Stay Logged In
          </Button>
          <Button
            variant="outlined"
            size="small"
            color="warning"
            onClick={() => router.push('/auth/login')}
          >
            Log Out
          </Button>
        </Box>
      </Alert>
    );
  }

  return null;
}
