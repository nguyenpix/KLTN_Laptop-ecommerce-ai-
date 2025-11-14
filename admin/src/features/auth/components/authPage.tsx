import React from 'react';
import { Button } from '@/shared/components/ui/button';
import { Link } from 'react-router-dom';
import LoginForm from '../components/LoginForm';

const AuthPage = () => {
  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <div className="text-sm text-muted-foreground mb-2">
          <Link to="/" className="hover:underline">Home</Link>
          <span className="mx-1"> &gt; </span>
          <span className="font-semibold">Customer Login</span>
        </div>
        <h2 className="text-3xl font-bold">Customer Login</h2>
      </div>
      <section className="flex justify-center">
        <div className="w-full max-w-md p-8">
          <h3 className="text-xl font-semibold mb-4">Registered Customers</h3>
          <p className="text-muted-foreground mb-6">If you have an account, sign in with your email address.</p>
          <LoginForm />
        </div>
        {}
        <div className="w-full max-w-md ml-8 p-8 border rounded-lg">
            <h3 className="text-xl font-semibold mb-4">New Customers</h3>
            <p className="text-muted-foreground mb-6">Creating an account has many benefits:</p>
            <ul className="list-disc list-inside text-muted-foreground mb-6">
                <li>Order history</li>
                <li>Track orders</li>
                <li>Faster checkout</li>
                <li>Save multiple shipping addresses</li>
            </ul>
            <Button className="w-full">Create an Account</Button>
        </div>
      </section>
    </div>
  );
};

export default AuthPage;