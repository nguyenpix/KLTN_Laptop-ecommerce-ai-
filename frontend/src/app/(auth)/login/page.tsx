"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

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

const formSchema = z.object({
  email: z.string().email({ message: "Email không hợp lệ." }),
  password: z.string().min(1, { message: "Mật khẩu không được để trống." }),
});

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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[13px] font-semibold text-black">
                Email <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <input
                  type="email"
                  placeholder="Your Name"
                  {...field}
                  className="w-full h-[50px] bg-white border border-[#A2A6B0] rounded-[4px] px-4 text-[14px] placeholder-[#A2A6B0] focus:outline-none focus:border-[#0156FF]"
                />
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
              <FormLabel className="text-[13px] font-semibold text-black">
                Password <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <input
                  type="password"
                  placeholder="Your Name"
                  {...field}
                  className="w-full h-[50px] bg-white border border-[#A2A6B0] rounded-[4px] px-4 text-[14px] placeholder-[#A2A6B0] focus:outline-none focus:border-[#0156FF]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center gap-6 pt-3">
          <button
            type="submit"
            disabled={isPending}
            className="w-[151px] h-[50px] rounded-full bg-[#0156FF] hover:bg-blue-700 text-white font-semibold text-[14px] transition-colors disabled:opacity-50"
          >
            {isPending ? 'Signing in...' : 'Sign In'}
          </button>

          <Link
            href="/forgot-password"
            className="text-[#0156FF] hover:underline text-[14px]"
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
    <main className="bg-white">
      <div className="container mx-auto px-4 py-6 pb-16">
        {/* Breadcrumb — Figma Register - 1 (node 133:3347) */}
        <nav className="text-[12px] text-black mb-4 flex items-center gap-1.5">
          <Link href="/" className="hover:text-[#0156FF]">
            Home
          </Link>
          <span className="text-[#0156FF]">›</span>
          <span>Login</span>
        </nav>

        {/* Title */}
        <h1 className="text-[32px] font-semibold text-black mb-7">Customer Login</h1>

        {/* 2-Column Layout (#F5F7FF boxes matching Figma 564px each) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-[1162px] mx-auto">
          {/* Registered Customers */}
          <div className="bg-[#F5F7FF] px-8 sm:px-14 py-10">
            <h2 className="text-[18px] font-semibold text-black mb-3">
              Registered Customers
            </h2>
            <p className="text-[14px] text-black mb-6 font-light">
              If you have an account, sign in with your email address.
            </p>
            <LoginForm />
          </div>

          {/* New Customer */}
          <div className="bg-[#F5F7FF] px-8 sm:px-14 py-10">
            <h2 className="text-[18px] font-semibold text-black mb-3">
              New Customer?
            </h2>
            <p className="text-[14px] text-black mb-4 font-light">
              Creating an account has many benefits:
            </p>
            <ul className="space-y-1.5 text-[14px] text-black font-light mb-9">
              <li>• Check out faster</li>
              <li>• Keep more than one address</li>
              <li>• Track orders and more</li>
            </ul>
            <Link
              href="/register"
              className="inline-flex items-center justify-center w-[208px] h-[50px] rounded-full bg-[#0156FF] hover:bg-blue-700 text-white font-semibold text-[14px] transition-colors"
            >
              Create An Account
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
};

export default CustomerLoginPage;
