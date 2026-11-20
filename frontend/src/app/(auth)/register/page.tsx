"use client";

import React from 'react';
import RegisterForm from '@/features/auth/components/RegisterForm';
import Link from 'next/link';

const RegisterPage = () => {
  return (
    <main className="bg-white">
      <div className="container mx-auto px-4 py-6 pb-16">
        {/* Breadcrumb */}
        <nav className="text-[12px] text-black mb-4 flex items-center gap-1.5">
          <Link href="/" className="hover:text-[#0156FF]">
            Home
          </Link>
          <span className="text-[#0156FF]">›</span>
          <span>Create an Account</span>
        </nav>

        {/* Title */}
        <h1 className="text-[32px] font-semibold text-black mb-7">
          Create New Customer Account
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-[1162px] mx-auto items-start">
          <div className="bg-[#F5F7FF] px-8 sm:px-14 py-10">
            <h2 className="text-[18px] font-semibold text-black mb-3">
              Personal Information
            </h2>
            <p className="text-[14px] text-black font-light mb-6">
              Please enter the following information to create your account.
            </p>
            <RegisterForm />
          </div>

          <div className="bg-[#F5F7FF] px-8 sm:px-14 py-10">
            <h2 className="text-[18px] font-semibold text-black mb-3">
              Registered Customers
            </h2>
            <p className="text-[14px] text-black font-light mb-8">
              If you already have an account, sign in with your email address.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center justify-center w-[151px] h-[50px] rounded-full bg-[#0156FF] hover:bg-blue-700 text-white font-semibold text-[14px] transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
};

export default RegisterPage;
