// components/auth/LoginForm.tsx (Chi tiết)

"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import Link from 'next/link';

// Schema xác thực cho form Đăng nhập
const loginSchema = z.object({
  email: z.string().email({ message: "Email không hợp lệ." }),
  password: z.string().min(1, { message: "Mật khẩu không được để trống." }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginForm = () => {
  // const { mutate: loginUser, isPending } = useLogin(); // Giả định hook đăng nhập
  const isPending = false; // Thay thế bằng hook thực tế

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormValues) => {
    console.log("Đăng nhập với:", data);
    // Xử lý logic đăng nhập thực tế ở đây
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="login-email">Email <span className="text-red-500">*</span></Label>
        <Input 
          id="login-email" 
          type="email" 
          placeholder="Your Name" 
          className="w-full"
          {...register("email")} 
        />
        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="login-password">Password <span className="text-red-500">*</span></Label>
        <Input 
          id="login-password" 
          type="password" 
          placeholder="Your Name" 
          className="w-full"
          {...register("password")} 
        />
        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
      </div>

      <div className="flex items-center space-x-4 pt-2">
        <Button 
          type="submit" 
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 font-semibold rounded-lg"
          disabled={isPending}
        >
          {isPending ? "Đang đăng nhập..." : "Sign in"}
        </Button>
        
        <Link 
          href="/forgot-password" 
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          Forgot Your Password?
        </Link>
      </div>
    </form>
  );
};

export default LoginForm;