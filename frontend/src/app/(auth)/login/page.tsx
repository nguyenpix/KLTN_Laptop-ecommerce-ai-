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

        <div className="flex items-center justify-between pt-2">
          <Button 
            type="submit" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-medium"
            disabled={isPending}
          >
            {isPending ? 'Signing in...' : 'Sign In'}
          </Button>
          
          <Link 
            href="/forgot-password" 
            className="text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline"
          >
            Forgot Your Password?
          </Link>
        </div>
      </form>
    </Form>
  );
};


const CustomerLoginPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4">
        <p className="text-sm text-gray-600">
          <Link href="/" className="hover:text-blue-600">Home</Link> 
          <span className="mx-2">›</span>
          <span>Login</span>
        </p>
      </div>

      {/* Title */}
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-4xl font-bold text-gray-900">Customer Login</h1>
      </div>

      {/* Login Content */}
      <div className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl">
          
          {/* Registered Customers */}
          <div className="bg-blue-50 p-8 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Registered Customers</h2>
            <p className="text-gray-700 mb-6">
              If you have an account, sign in with your email address.
            </p>
            
            <LoginForm />
          </div>

          {/* New Customer */}
          <div className="bg-blue-50 p-8 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">New Customer?</h2>
            
            <p className="text-gray-700 mb-4">
              Creating an account has many benefits:
            </p>
            
            <ul className="space-y-2 text-gray-700 mb-8">
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>Check out faster</span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>Keep more than one address</span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>Track orders and more</span>
              </li>
            </ul>
            
            <Link href="/register">
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-medium"
              >
                Create An Account
              </Button>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CustomerLoginPage;
