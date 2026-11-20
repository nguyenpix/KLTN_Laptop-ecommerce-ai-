"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, Sparkles, Truck } from "lucide-react";

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Top Breadcrumb & Title - Figma About Us - 1 (Node 126:4439) */}
      <div className="container mx-auto px-4 py-6 max-w-[1400px]">
        <nav className="text-[12px] text-black mb-4 flex items-center gap-1.5">
          <Link href="/" className="hover:text-[#0156FF]">
            Home
          </Link>
          <span className="text-[#0156FF]">›</span>
          <span className="text-[#A2A6B0]">About Us</span>
        </nav>

        <h1 className="text-[32px] font-semibold text-black mb-4">About Us</h1>
      </div>

      {/* Block 1: Dark Background - A Family That Keeps On Growing */}
      <section className="bg-[#020203] text-white py-20">
        <div className="container mx-auto px-4 max-w-[1160px] grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-[38px] md:text-[44px] font-medium leading-[1.25] mb-6">
              A Family That Keeps On Growing
            </h2>
            <div className="text-[16px] font-light text-white/85 leading-[26px] space-y-4">
              <p>
                We always aim to please the home market, supplying great
                computers and hardware at great prices to non-corporate
                customers, through our large showroom and our online store.
              </p>
              <p>
                Shop management approach fosters a strong customer service focus
                in our staff. We prefer to cultivate long-term client
                relationships rather than achieve quick sales, demonstrated in
                the measure of our long-term success.
              </p>
            </div>
          </div>
          <div className="relative h-[360px] lg:h-[440px] w-full rounded overflow-hidden">
            <Image
              src="/assets/image/banner1.png"
              alt="Showroom"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Block 2: White Background - Shop.com */}
      <section className="bg-white text-black py-20">
        <div className="container mx-auto px-4 max-w-[1160px] grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative h-[340px] lg:h-[420px] w-full rounded overflow-hidden order-2 lg:order-1">
            <Image
              src="/assets/image/banner2.jpg"
              alt="Laptop Store"
              fill
              className="object-cover"
            />
          </div>
          <div className="order-1 lg:order-2">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-[50px] h-[50px] rounded-full bg-[#0156FF] text-white flex items-center justify-center font-bold text-[20px]">
                S
              </div>
              <h2 className="text-[38px] md:text-[44px] font-medium leading-[1.25]">
                shop.com
              </h2>
            </div>
            <p className="text-[16px] font-light text-[#666666] leading-[26px]">
              Shop.com is a proudly owned supplier of I.T. goods and services.
              Our client base encompasses individuals, students, creative
              professionals, gamers, small businesses, and corporate
              organisations. We provide complete laptop and AI-powered
              recommendation solutions, centred on high quality hardware and
              exceptional customer service.
            </p>
          </div>
        </div>
      </section>

      {/* Block 3: Dark Background - Now You're In Safe Hands */}
      <section className="bg-[#020203] text-white py-20">
        <div className="container mx-auto px-4 max-w-[1160px] grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-[50px] h-[50px] rounded-full bg-[#0156FF] text-white flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6" />
              </div>
              <h2 className="text-[36px] md:text-[42px] font-medium leading-[1.25]">
                Now You&apos;re In Safe Hands
              </h2>
            </div>
            <div className="text-[16px] font-light text-white/85 leading-[26px] space-y-4">
              <p>
                Experience a 40% boost in computing from last generation. Our
                laptops equip the latest processors and GPUs with the upmost
                computing power to bring you an unparalleled working and gaming
                experience.
              </p>
              <p className="text-[13px] text-[#A2A6B0]">
                *Performance compared to previous generation. Specs varies by
                model.
              </p>
            </div>
          </div>
          <div className="relative h-[360px] lg:h-[420px] w-full rounded overflow-hidden">
            <Image
              src="/assets/image/msi.png"
              alt="High Performance Laptops"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Block 4: White Background - The Highest Quality of Products */}
      <section className="bg-white text-black py-20">
        <div className="container mx-auto px-4 max-w-[1160px] grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative h-[340px] lg:h-[420px] w-full rounded overflow-hidden order-2 lg:order-1">
            <Image
              src="/assets/image/dell.jpg"
              alt="Quality Control"
              fill
              className="object-cover"
            />
          </div>
          <div className="order-1 lg:order-2">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-[50px] h-[50px] rounded-full bg-[#0156FF] text-white flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h2 className="text-[36px] md:text-[42px] font-medium leading-[1.25]">
                The Highest Quality of Products
              </h2>
            </div>
            <p className="text-[16px] font-light text-[#666666] leading-[26px]">
              We guarantee the highest quality of the products we sell. Several
              decades of successful operation and millions of happy customers
              let us feel certain about that. Besides, all items we sell pass
              thorough quality control, so no characteristics mismatch can
              escape the eye of our professionals.
            </p>
          </div>
        </div>
      </section>

      {/* Block 5: Dark Background - Delivery to All Regions */}
      <section className="bg-[#020203] text-white py-20">
        <div className="container mx-auto px-4 max-w-[1160px] grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-[50px] h-[50px] rounded-full bg-[#0156FF] text-white flex items-center justify-center flex-shrink-0">
                <Truck className="w-6 h-6" />
              </div>
              <h2 className="text-[36px] md:text-[42px] font-medium leading-[1.25]">
                We Deliver to Any Regions
              </h2>
            </div>
            <p className="text-[16px] font-light text-white/85 leading-[26px]">
              We deliver our goods all across the country. No matter where you
              live, your order will be shipped in time and delivered right to
              your door or to any other location you have stated. The packages
              are handled with utmost care, so the ordered products will be
              handed to you safe and sound, just like you expect them to be.
            </p>
          </div>
          <div className="relative h-[360px] lg:h-[420px] w-full rounded overflow-hidden">
            <Image
              src="/assets/image/lenovo.jpg"
              alt="Nationwide Delivery"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Testimonial Section - Figma Group 62 (1160px, #F5F7FF) */}
      <section className="py-16 bg-white">
        <div className="max-w-[1160px] mx-auto bg-[#F5F7FF] px-8 md:px-[119px] py-[45px]">
          <div className="flex items-start gap-6">
            <span className="text-[64px] leading-none font-serif text-black select-none">
              &lsquo;&rsquo;
            </span>
            <div className="flex-1">
              <blockquote className="text-[18px] text-black leading-[27px] mb-3">
                My first order arrived today in perfect condition. From the time
                I sent a question about the item to making the purchase, to the
                shipping and now the delivery, your company, Tecs, has stayed in
                touch. Such great customer service. I look forward to shopping
                on your site in the future and would highly recommend it.
              </blockquote>
              <div className="text-[14px] text-black text-right">
                - Tama Brown
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <Link
              href="/products"
              className="inline-flex items-center justify-center h-[37px] px-[26px] border-2 border-[#0156FF] text-[#0156FF] text-[14px] font-semibold rounded-[50px] hover:bg-[#0156FF] hover:text-white transition-colors"
            >
              Leave Us A Review
            </Link>
            <div className="flex items-center gap-2.5">
              {[1, 2, 3, 4].map((dot) => (
                <span
                  key={dot}
                  className={`w-3 h-3 rounded-full ${
                    dot === 1 ? "bg-[#0156FF]" : "bg-[#CACDD8]"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
