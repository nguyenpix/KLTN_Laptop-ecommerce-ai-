'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function HomePage() {
  const router = useRouter();
  const { isLoggedIn, user } = useAuthStore();

  useEffect(() => {
    
    if (isLoggedIn && user?.role === 'admin') {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  }, [isLoggedIn, user, router]);

  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Đang chuyển hướng...</p>
      </div>
    </div>
  );
}
