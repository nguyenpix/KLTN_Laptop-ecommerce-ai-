"use client";

import React from 'react';
import RegisterForm from '@/features/auth/components/RegisterForm';
import Link from 'next/link';
import { Button } from '@/shared/components/ui/button';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/shared/components/ui/breadcrumb';

const RegisterPage = () => {
  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Create an Account</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <h2 className="text-3xl font-bold">Create an Account</h2>
      </div>
      <section className="flex justify-center">
        <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Personal Information</h3>
          <p className="text-gray-600 mb-6">Please enter the following information to create your account.</p>
          <RegisterForm />
        </div>
        <div className="w-full max-w-md ml-8 p-8 rounded-lg shadow-md bg-gray-50">
            <h3 className="text-xl font-semibold mb-4">Registered Customers</h3>
            <p className="text-gray-600 mb-6">If you already have an account, you can sign in here.</p>
            <Link href="/login">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">Sign In</Button>
            </Link>
        </div>
      </section>
    </div>
  );
};

export default RegisterPage;