import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/shared/components/ui/button';
import { Input } from  '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useLogin } from '../hooks/useLogin'; 
import { LoginPayload } from '../types';

// Schema validation với Zod
const loginSchema = z.object({
  email: z.string().email({ message: "Email không hợp lệ." }),
  password: z.string().min(6, { message: "Mật khẩu phải có ít nhất 6 ký tự." }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginForm = () => {
  const navigate = useNavigate();
  const { mutate: login, isPending } = useLogin(); 

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormValues) => {
    login(data, {
      onSuccess: (res) => {
        toast.success(`Chào mừng ${res.user.name || res.user.email}!`, {
          description: "Đăng nhập thành công!",
        });
        navigate('/');
      },
      onError: (error) => {
        toast.error("Đăng nhập thất bại", {
          description: error.message || "Email hoặc mật khẩu không đúng.",
        });
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
        <Input id="email" type="email" placeholder="Email" {...register("email")} />
        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
      </div>
      <div>
        <Label htmlFor="password">Mật khẩu <span className="text-red-500">*</span></Label>
        <Input id="password" type="password" placeholder="Mật khẩu" {...register("password")} />
        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
      </div>

      <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isPending}>
        {isPending ? "Đang đăng nhập..." : "Đăng nhập"}
      </Button>
    </form>
  );
};

export default LoginForm;
