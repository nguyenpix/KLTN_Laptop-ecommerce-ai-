'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MapPin, Phone, Clock, Mail } from 'lucide-react';
import { toast } from 'sonner';

export default function ContactUsPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất.');
    setFormData({ name: '', email: '', phone: '', message: '' });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-6 pb-16">
        {/* Breadcrumb — Figma Contact Us - 1 (node 133:3117) */}
        <nav className="text-[12px] text-black mb-4 flex items-center gap-1.5">
          <Link href="/" className="hover:text-[#0156FF]">
            Home
          </Link>
          <span className="text-[#0156FF]">›</span>
          <span>Contact Us</span>
        </nav>

        {/* Title & Subtitle */}
        <div className="mb-8">
          <h1 className="text-[32px] font-semibold text-black mb-3">Contact Us</h1>
          <p className="text-[16px] text-black font-light leading-relaxed">
            We love hearing from you, our Shop customers.
            <br />
            Please contact us and we will make sure to get back to you as soon as we possibly can.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 items-start">
          {/* Contact Form (Left) */}
          <div className="flex-1 w-full">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[13px] font-semibold text-black mb-2">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full h-[50px] bg-white border border-[#A2A6B0] rounded-[4px] px-4 text-[14px] placeholder-[#A2A6B0] focus:outline-none focus:border-[#0156FF]"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-black mb-2">
                    Your Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Your Name"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full h-[50px] bg-white border border-[#A2A6B0] rounded-[4px] px-4 text-[14px] placeholder-[#A2A6B0] focus:outline-none focus:border-[#0156FF]"
                  />
                </div>
              </div>

              <div className="max-w-[449px]">
                <label className="block text-[13px] font-semibold text-black mb-2">
                  Your Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="Your Phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full h-[50px] bg-white border border-[#A2A6B0] rounded-[4px] px-4 text-[14px] placeholder-[#A2A6B0] focus:outline-none focus:border-[#0156FF]"
                />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-black mb-2">
                  What&rsquo;s on your mind? <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="message"
                  placeholder="Jot us a note and we’ll get back to you as quickly as possible"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={7}
                  className="w-full bg-white border border-[#A2A6B0] rounded-[4px] p-4 text-[14px] placeholder-[#A2A6B0] focus:outline-none focus:border-[#0156FF] resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-[151px] h-[50px] rounded-full bg-[#0156FF] hover:bg-blue-700 text-white font-semibold text-[14px] transition-colors"
              >
                Submit
              </button>
            </form>
          </div>

          {/* Contact Information Sidebar — Figma Rectangle 17 (#F5F7FF, 411px) */}
          <aside className="w-full lg:w-[411px] shrink-0 bg-[#F5F7FF] p-8 space-y-6">
            <div className="flex items-start gap-4">
              <MapPin className="w-6 h-6 text-black shrink-0 mt-0.5" />
              <div>
                <h3 className="text-[18px] font-semibold text-black">Address:</h3>
                <p className="text-[13px] text-black mt-0.5">
                  19 Nguyễn Du, P7, Gò Vấp, TPHCM
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Phone className="w-6 h-6 text-black shrink-0 mt-0.5" />
              <div>
                <h3 className="text-[18px] font-semibold text-black">Phone:</h3>
                <p className="text-[13px] text-black mt-0.5">0987556203</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Clock className="w-6 h-6 text-black shrink-0 mt-0.5" />
              <div>
                <h3 className="text-[18px] font-semibold text-black">We are open:</h3>
                <div className="text-[13px] text-black mt-0.5 space-y-0.5">
                  <p>Monday - Thursday: 9:00 AM - 5:30 PM</p>
                  <p>Friday 9:00 AM - 6:00 PM</p>
                  <p>Saturday: 11:00 AM - 5:00 PM</p>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Mail className="w-6 h-6 text-black shrink-0 mt-0.5" />
              <div>
                <h3 className="text-[18px] font-semibold text-black">E-mail:</h3>
                <a
                  href="mailto:NguyenDangNguyen1606@gmail.com"
                  className="text-[13px] text-[#0156FF] hover:underline mt-0.5 block"
                >
                  NguyenDangNguyen1606@gmail.com
                </a>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
