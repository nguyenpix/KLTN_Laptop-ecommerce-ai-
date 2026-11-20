"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui/form';
import { useRegister, RegisterPayload } from '../api/useRegister';

const registerSchema = z
  .object({
    name: z.string().min(2, { message: "Tên phải có ít nhất 2 ký tự." }),
    phone: z
      .string()
      .regex(/^[0-9]{10,11}$/, { message: "Số điện thoại không hợp lệ (10-11 chữ số)." }),
    email: z.string().email({ message: "Email không hợp lệ." }),
    address: z.string().min(10, { message: "Địa chỉ phải có ít nhất 10 ký tự." }),
    password: z.string().min(6, { message: "Mật khẩu phải có ít nhất 6 ký tự." }),
    confirmPassword: z
      .string()
      .min(6, { message: "Xác nhận mật khẩu phải có ít nhất 6 ký tự." }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp.",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

const inputClass =
  "w-full h-[50px] bg-white border border-[#A2A6B0] rounded-[4px] px-4 text-[14px] placeholder-[#A2A6B0] focus:outline-none focus:border-[#0156FF]";

const RegisterForm = () => {
  const router = useRouter();
  const { mutate: registerUser, isPending } = useRegister();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      address: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (data: RegisterFormValues) => {
    const payload: RegisterPayload = {
      name: data.name,
      phone: data.phone,
      email: data.email,
      address: data.address,
      password: data.password,
    };

    registerUser(payload, {
      onSuccess: () => {
        toast.success("Đăng ký thành công!", {
          description: "Bạn sẽ được chuyển đến trang đăng nhập.",
        });
        router.push('/login');
      },
      onError: (error: Error) => {
        toast.error("Đăng ký thất bại", {
          description: error.message || "Đã có lỗi xảy ra trong quá trình đăng ký.",
        });
      },
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[13px] font-semibold text-black">
                Full Name <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <input placeholder="Your Name" {...field} className={inputClass} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[13px] font-semibold text-black">
                Email <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <input type="email" placeholder="Your Email" {...field} className={inputClass} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[13px] font-semibold text-black">
                Phone Number <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <input type="tel" placeholder="0901234567" {...field} className={inputClass} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[13px] font-semibold text-black">
                Address <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <input
                  placeholder="Số nhà, đường, quận/huyện, tỉnh/thành phố"
                  {...field}
                  className={inputClass}
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
                <input type="password" placeholder="Password" {...field} className={inputClass} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[13px] font-semibold text-black">
                Confirm Password <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <input
                  type="password"
                  placeholder="Confirm Password"
                  {...field}
                  className={inputClass}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="pt-3">
          <button
            type="submit"
            disabled={isPending}
            className="w-[208px] h-[50px] rounded-full bg-[#0156FF] hover:bg-blue-700 text-white font-semibold text-[14px] transition-colors disabled:opacity-50"
          >
            {isPending ? "Creating..." : "Create An Account"}
          </button>
        </div>
      </form>
    </Form>
  );
};

export default RegisterForm;
