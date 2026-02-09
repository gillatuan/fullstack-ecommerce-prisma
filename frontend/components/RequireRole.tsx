"use client"

import React from 'react'
import useAuth from 'app/auth/useAuth'
import { useRouter } from 'next/navigation'

type Props = {
  roles: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function RequireRole({ roles, children, fallback = null }: Props) {
  const { user } = useAuth();
  const router = useRouter();

  if (!user) {
    // not authenticated
    router.push('/auth/login');
    return null;
  }

  const has = (user.roles || []).some(r => roles.includes(r));
  if (!has) return <>{fallback}</>;

  return <>{children}</>;
}
