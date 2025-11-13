'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MapPin, Phone, Clock, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

export default function ContactUsPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Add your form submission logic here
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Contact Us</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Title */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-3">Contact Us</h1>
          <p className="text-gray-600 mb-2">
            We love hearing from you, our Shop customers.
          </p>
          <p className="text-gray-600">
            Please contact us and we will make sure to get back to you as soon as we possibly can.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name and Email Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    name="name"
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Your Email <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="email"
                    name="email"
                    placeholder="Your Name"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Your Phone Number
                </label>
                <Input
                  type="tel"
                  name="phone"
                  placeholder="Your Phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  What's on your mind? <span className="text-red-500">*</span>
                </label>
                <Textarea
                  name="message"
                  placeholder="Jot us a note and we'll get back to you as quickly as possible"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={8}
                  className="w-full resize-none"
                />
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-6 rounded-full text-base font-medium"
              >
                Submit
              </Button>
            </form>
          </div>

          {/* Contact Information Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-100 rounded-lg p-6 space-y-6">
              {/* Address */}
              <div className="flex items-start gap-3">
                <div className="bg-white p-2 rounded-full">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Address:</h3>
                  <p className="text-sm text-gray-600">
                    1234 Street Adress City Address, 1234
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-3">
                <div className="bg-white p-2 rounded-full">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Phone:</h3>
                  <p className="text-sm text-gray-600">(00)1234 5678</p>
                </div>
              </div>

              {/* Working Hours */}
              <div className="flex items-start gap-3">
                <div className="bg-white p-2 rounded-full">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">We are open:</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Monday - Thursday: 9:00 AM - 5:30 PM</p>
                    <p>Friday 9:00 AM - 6:00 PM</p>
                    <p>Saturday: 11:00 AM - 5:00 PM</p>
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-3">
                <div className="bg-white p-2 rounded-full">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">E-mail:</h3>
                  <a 
                    href="mailto:shop@email.com" 
                    className="text-sm text-blue-600 hover:underline"
                  >
                    shop@email.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
