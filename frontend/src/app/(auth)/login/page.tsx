"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui/form';
import { toast } from 'sonner';

import { useLogin } from '@/features/auth/api/useLogin';
import { useAuthStore } from '@/store/authStore';
import { LoginCredentials } from '@/features/auth/types';

// 1. Zod Schema
const formSchema = z.object({
  email: z.string().email({ message: "Email không hợp lệ." }),
  password: z.string().min(1, { message: "Mật khẩu không được để trống." }),
});

// 2. LoginForm Component
const LoginForm = () => {
  const router = useRouter();
  const { login } = useAuthStore();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { mutate: loginUser, isPending } = useLogin();

  const onSubmit = (values: LoginCredentials) => {
    loginUser(values, {
      onSuccess: (data) => {
        toast.success("Thành công", {
          description: data.message,
        });
        login(data.data.token, data.data.user);
        router.push('/');
      },
      onError: (error) => {
        toast.error("Lỗi", {
          description: error.message,
        });
      },
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Input placeholder="Nhập email của bạn" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mật khẩu <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Input type="password" placeholder="Nhập mật khẩu của bạn" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center space-x-4 pt-2">
          <Button 
            type="submit" 
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 font-semibold rounded-lg"
            disabled={isPending}
          >
            {isPending ? 'Đang đăng nhập...' : 'Sign in'}
          </Button>
          
          <Link 
            href="/forgot-password" 
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Quên mật khẩu?
          </Link>
        </div>
      </form>
    </Form>
  );
};


const CustomerLoginPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="py-4 px-6 md:px-12">
        <p className="text-sm text-gray-600">
          <Link href="/">Trang chủ</Link> &gt; Đăng nhập
        </p>
      </header>

      <div className="container mx-auto px-4 md:px-6 py-6">
        <h1 className="text-3xl md:text-4xl font-semibold text-gray-800 mb-8">Đăng Nhập</h1>
      </div>

      <div className="container mx-auto px-4 md:px-6 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          
          <div className="bg-white p-8 md:p-10 rounded-lg shadow-md border border-gray-100">
            <h2 className="text-xl font-semibold mb-6 text-gray-800">Khách Hàng Đã Đăng Ký</h2>
            <p className="text-gray-600 mb-8">
              Nếu bạn đã có tài khoản, hãy đăng nhập bằng địa chỉ email của bạn.
            </p>
            
            <LoginForm />

          </div>

          <div className="bg-white p-8 md:p-10 rounded-lg shadow-md border border-gray-100">
            <h2 className="text-xl font-semibold mb-6 text-gray-800">Khách Hàng Mới?</h2>
            
            <p className="text-gray-600 mb-6">
              Tạo tài khoản có nhiều lợi ích:
            </p>
            
            <ul className="list-disc list-inside space-y-2 text-gray-600 mb-10 ml-4">
              <li>Thanh toán nhanh hơn</li>
              <li>Lưu nhiều địa chỉ</li>
              <li>Theo dõi đơn hàng và hơn thế nữa</li>
            </ul>
            
            <Link href="/register" passHref>
              <Button 
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 font-semibold rounded-lg text-white"
              >
                Tạo tài khoản
              </Button>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CustomerLoginPage;
