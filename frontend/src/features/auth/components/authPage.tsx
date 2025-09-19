import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import LoginForm from '../components/LoginForm';

const AuthPage = () => {
  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <div className="text-sm text-gray-500 mb-2">
          <Link to="/" className="hover:underline">Home</Link>
          <span className="mx-1"> &gt; </span>
          <span className="font-semibold">Customer Login</span>
        </div>
        <h2 className="text-3xl font-bold">Customer Login</h2>
      </div>
      <section className="flex justify-center">
        <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Registered Customers</h3>
          <p className="text-gray-600 mb-6">If you have an account, sign in with your email address.</p>
          <LoginForm />
        </div>
        {/* Placeholder cho phần New Customers */}
        <div className="w-full max-w-md ml-8 p-8 rounded-lg shadow-md bg-gray-50">
            <h3 className="text-xl font-semibold mb-4">New Customers</h3>
            <p className="text-gray-600 mb-6">Creating an account has many benefits:</p>
            <ul className="list-disc list-inside text-gray-600 mb-6">
                <li>Order history</li>
                <li>Track orders</li>
                <li>Faster checkout</li>
                <li>Save multiple shipping addresses</li>
            </ul>
            <Button className="w-full bg-blue-600 hover:bg-blue-700">Create an Account</Button>
        </div>
      </section>
    </div>
  );
};

export default AuthPage;