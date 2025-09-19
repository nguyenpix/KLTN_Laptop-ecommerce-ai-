'use client';

import { useEffect } from 'react';
import { hydrateAuth } from '@/store/authStore';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Nạp lại trạng thái auth từ localStorage khi component được mount ở client
    hydrateAuth();
  }, []);

  return <>{children}</>;
}
