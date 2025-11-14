'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isLoggedIn, user } = useAuthStore();

  useEffect(() => {
    
    if (!isLoggedIn) {
      router.push('/login');
    } else if (user && user.role !== 'admin') {
      
      useAuthStore.getState().logout();
      router.push('/login');
    }
  }, [isLoggedIn, user, router]);

  
  if (!isLoggedIn || !user || user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Đang kiểm tra xác thực...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
