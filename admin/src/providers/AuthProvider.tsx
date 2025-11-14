'use client';

import { useEffect } from 'react';
import { hydrateAuth } from '@/store/authStore';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    
    hydrateAuth();
  }, []);

  return <>{children}</>;
}
