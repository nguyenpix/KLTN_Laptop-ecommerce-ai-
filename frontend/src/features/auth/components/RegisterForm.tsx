"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/components/ui/form';
import { useRegister, RegisterPayload } from '../api/useRegister';

// --- Zod Schema for validation ---
const registerSchema = z.object({
  name: z.string().min(2, { message: "Tên phải có ít nhất 2 ký tự." }),
  phone: z.string().regex(/^[0-9]{10,11}$/, { message: "Số điện thoại không hợp lệ (10-11 chữ số)." }),
  email: z.string().email({ message: "Email không hợp lệ." }),
  address: z.string().min(10, { message: "Địa chỉ phải có ít nhất 10 ký tự." }),
  password: z.string().min(6, { message: "Mật khẩu phải có ít nhất 6 ký tự." }),
  confirmPassword: z.string().min(6, { message: "Xác nhận mật khẩu phải có ít nhất 6 ký tự." }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp.",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

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
        confirmPassword: ""
    }
  });

  const onSubmit = (data: RegisterFormValues) => {
    // Exclude 'confirmPassword' from the payload sent to the API
    const payload: RegisterPayload = {
      name: data.name,
      phone: data.phone,
      email: data.email,
      address: data.address,
      password: data.password,
    };

    registerUser(payload, {
      onSuccess: (res) => {
        toast.success("Đăng ký thành công!", {
          description: "Bạn sẽ được chuyển đến trang đăng nhập.",
        });
        router.push('/login'); // Correct redirection
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
              <FormLabel>Tên <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Input placeholder="Tên của bạn" {...field} />
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
              <FormLabel>Email <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Input type="email" placeholder="Email" {...field} />
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
              <FormLabel>Số điện thoại <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Input type="tel" placeholder="0901234567" {...field} />
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
              <FormLabel>Địa chỉ <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Input placeholder="Số nhà, đường, quận/huyện, tỉnh/thành phố" {...field} />
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
                <Input type="password" placeholder="Mật khẩu" {...field} />
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
              <FormLabel>Xác nhận mật khẩu <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Input type="password" placeholder="Xác nhận mật khẩu" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          className="w-full bg-blue-600 hover:bg-blue-700" 
          disabled={isPending}
        >
          {isPending ? "Đang đăng ký..." : "Đăng ký"}
        </Button>
      </form>
    </Form>
  );
};

export default RegisterForm;
