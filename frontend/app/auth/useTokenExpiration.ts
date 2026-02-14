'use client'

import { useEffect, useState } from 'react';
import useAuth from './useAuth';

type TokenStatus = 'valid' | 'expiring-soon' | 'expired';

// 🔑 Options to customize expiration behavior
interface UseTokenExpirationOptions {
  warningThreshold?: number;  // Seconds before expiration to warn (default: 300 = 5 min)
  checkInterval?: number;     // How often to check expiration (default: 30000 = 30 sec)
  onExpired?: () => void;     // Callback when token expires
  onExpiringSOon?: () => void; // Callback when token expiring soon
}

/**
 * Hook to track JWT token expiration
 * 
 * Usage:
 * ```
 * const tokenStatus = useTokenExpiration();
 * 
 * if (tokenStatus === 'expiring-soon') {
 *   // Show warning banner
 * }
 * ```
 */
export function useTokenExpiration(options: UseTokenExpirationOptions = {}) {
  const {
    warningThreshold = 300,      // 5 minutes
    checkInterval = 30000,       // 30 seconds
    onExpired,
    onExpiringSOon,
  } = options;

  const { user } = useAuth();
  const [status, setStatus] = useState<TokenStatus>('valid');
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (!user?.exp) {
      setStatus('expired');
      setSecondsRemaining(null);
      onExpired?.();
      return;
    }

    const checkExpiration = () => {
      const now = Math.floor(Date.now() / 1000);
      const remaining = user.exp && user.exp - now || 0;
      
      setSecondsRemaining(remaining);

      let newStatus: TokenStatus = 'valid';
      
      if (remaining < 0) {
        newStatus = 'expired';
        onExpired?.();
      } else if (remaining < warningThreshold) {
        newStatus = 'expiring-soon';
        onExpiringSOon?.();
      }
      
      setStatus(newStatus);
    };

    // Check immediately
    checkExpiration();

    // Then check periodically
    const interval = setInterval(checkExpiration, checkInterval);
    return () => clearInterval(interval);
  }, [user?.exp, warningThreshold, checkInterval, onExpired, onExpiringSOon]);

  return {
    status,
    secondsRemaining,
    isExpired: status === 'expired',
    isExpiringSOon: status === 'expiring-soon',
  };
}

export default useTokenExpiration;
