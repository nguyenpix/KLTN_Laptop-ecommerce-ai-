"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Facebook, Instagram } from "lucide-react";
import { useCategories } from "@/features/products/hook/useCategories";
import { useBrands } from "@/features/products/hook/useBrands";
import { toast } from "sonner";

const widgetsHeader = [
  {
    title: "Product Support",
    context:
      "Up to 3 years on-site warranty available for your peace of mind.",
    urlImg: "/assets/icon/support.svg",
  },
  {
    title: "Personal Account",
    context:
      "With big discounts, free delivery and a dedicated support specialist.",
    urlImg: "/assets/icon/account.svg",
  },
  {
    title: "Amazing Savings",
    context: "Up to 70% off new Products, you can be sure of the best price.",
    urlImg: "/assets/icon/saving.svg",
  },
];

const paymentIcons = [
  "/assets/icon/payment01.svg",
  "/assets/icon/payment02.svg",
  "/assets/icon/payment03.svg",
  "/assets/icon/payment04.svg",
  "/assets/icon/payment05.svg",
];

const Footer = () => {
  const { data: categoriesData } = useCategories();
  const { data: brandsData } = useBrands();
  const categories: Array<{ _id: string; name: string }> =
    categoriesData?.data || [];
  const brands: Array<{ _id: string; name: string }> = brandsData?.data || [];
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    toast.success("Cảm ơn bạn đã đăng ký nhận bản tin khuyến mãi!");
    setEmail("");
  };

  return (
    <footer>
      {/* Service Features Section — Figma Component 16 (#F5F7FF background band) */}
      <div className="bg-[#F5F7FF] py-14">
        <div className="container mx-auto px-4 max-w-[1400px]">
          <div className="flex flex-col md:flex-row items-center justify-center gap-12 lg:gap-28">
            {widgetsHeader.map((widget, index) => (
              <div
                key={index}
                className="flex flex-col items-center text-center max-w-[265px]"
              >
                <img
                  src={widget.urlImg}
                  alt={widget.title}
                  className="h-[65px] w-[65px] mb-6"
                />
                <h3 className="text-[18px] font-bold text-black mb-3">
                  {widget.title}
                </h3>
                <p className="text-[14px] text-black/70 leading-relaxed">
                  {widget.context}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer — Figma Group 35 (#020203 background) */}
      <div className="bg-[#020203] text-white">
        <div className="container mx-auto px-4 pt-12 pb-9 max-w-[1400px]">
          {/* Newsletter Section */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-11">
            <div>
              <h2 className="text-[32px] lg:text-[38px] font-medium mb-1">
                Sign Up To Our Newsletter.
              </h2>
              <span className="text-[16px] font-light text-white/80">
                Be the first to hear about the latest offers.
              </span>
            </div>
            <form
              onSubmit={handleSubscribe}
              className="flex flex-wrap items-center gap-4"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your Email"
                className="bg-black border-2 border-white rounded-[4px] w-full sm:w-[391px] h-[50px] px-4 text-white placeholder-white font-light text-[14px] focus:outline-none focus:border-[#0156FF]"
              />
              <button
                type="submit"
                className="bg-[#0156FF] hover:bg-blue-700 text-white rounded-[50px] w-[151px] h-[50px] text-[14px] font-semibold transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>

          {/* 5 Columns Links Section — Dynamically Populated from Project Database */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 text-[13px]">
            {/* Col 1: Information */}
            <div>
              <h4 className="font-bold text-white/50 mb-5 text-[14px]">
                Information
              </h4>
              <ul className="space-y-1.5">
                <li>
                  <Link href="/about" className="hover:underline text-white">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:underline text-white">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/products" className="hover:underline text-white">
                    Search
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:underline text-white">
                    Terms &amp; Conditions
                  </Link>
                </li>
                <li>
                  <Link
                    href="/profile/orders"
                    className="hover:underline text-white"
                  >
                    Orders and Returns
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:underline text-white">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/profile" className="hover:underline text-white">
                    My Account
                  </Link>
                </li>
                <li>
                  <Link href="/wishlist" className="hover:underline text-white">
                    My Wish List
                  </Link>
                </li>
                <li>
                  <Link
                    href="/profile/recommendations"
                    className="hover:underline text-white"
                  >
                    AI Recommendations
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 2: Hardware Specs (Database Spec Filters) */}
            <div>
              <h4 className="font-bold text-white/50 mb-5 text-[14px]">
                PC Parts &amp; Specs
              </h4>
              <ul className="space-y-1.5">
                <li>
                  <Link
                    href="/products?cpu=i7"
                    className="hover:underline text-white"
                  >
                    Intel Core i7 / i9 CPUs
                  </Link>
                </li>
                <li>
                  <Link
                    href="/products?cpu=i5"
                    className="hover:underline text-white"
                  >
                    Intel Core i5 CPUs
                  </Link>
                </li>
                <li>
                  <Link
                    href="/products?cpu=Ryzen"
                    className="hover:underline text-white"
                  >
                    AMD Ryzen Processors
                  </Link>
                </li>
                <li>
                  <Link
                    href="/products?gpu=RTX"
                    className="hover:underline text-white"
                  >
                    NVIDIA GeForce RTX Cards
                  </Link>
                </li>
                <li>
                  <Link
                    href="/products?ram=16GB"
                    className="hover:underline text-white"
                  >
                    16GB RAM (Memory)
                  </Link>
                </li>
                <li>
                  <Link
                    href="/products?ram=32GB"
                    className="hover:underline text-white"
                  >
                    32GB RAM (Memory)
                  </Link>
                </li>
                <li>
                  <Link
                    href="/products?storage=512GB"
                    className="hover:underline text-white"
                  >
                    512GB NVMe SSD
                  </Link>
                </li>
                <li>
                  <Link
                    href="/products?storage=1TB"
                    className="hover:underline text-white"
                  >
                    1TB NVMe SSD
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 3: Brands from Database */}
            <div>
              <h4 className="font-bold text-white/50 mb-5 text-[14px]">
                Laptop Brands
              </h4>
              <ul className="space-y-1.5">
                {brands.length > 0 ? (
                  brands.map((brand) => (
                    <li key={brand._id}>
                      <Link
                        href={`/products?brand=${brand._id}`}
                        className="hover:underline text-white"
                      >
                        {brand.name} Laptops
                      </Link>
                    </li>
                  ))
                ) : (
                  <>
                    <li>
                      <Link
                        href="/products"
                        className="hover:underline text-white"
                      >
                        MSI Laptops
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/products"
                        className="hover:underline text-white"
                      >
                        ASUS Laptops
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/products"
                        className="hover:underline text-white"
                      >
                        Dell Laptops
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/products"
                        className="hover:underline text-white"
                      >
                        Acer Laptops
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/products"
                        className="hover:underline text-white"
                      >
                        Lenovo Laptops
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </div>

            {/* Col 4: Categories from Database */}
            <div>
              <h4 className="font-bold text-white/50 mb-5 text-[14px]">
                Laptops
              </h4>
              <ul className="space-y-1.5">
                <li>
                  <Link href="/products" className="hover:underline text-white">
                    Everyday Use Notebooks
                  </Link>
                </li>
                {categories.map((cat) => (
                  <li key={cat._id}>
                    <Link
                      href={`/products?category=${cat._id}`}
                      className="hover:underline text-white"
                    >
                      {cat.name} Notebooks
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href="/products?tags=New"
                    className="hover:underline text-white"
                  >
                    New Arrival Notebooks
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 5: Address */}
            <div>
              <h4 className="font-bold text-white/50 mb-5 text-[14px]">
                Address
              </h4>
              <ul className="space-y-1.5 text-white">
                <li>Address: 19 Nguyễn Du, P7, Gò Vấp, TPHCM</li>
                <li>
                  Phones:{" "}
                  <a
                    href="tel:0987556203"
                    className="text-[#0156FF] hover:underline"
                  >
                    0987 556 203
                  </a>
                </li>
                <li>We are open: Monday-Thursday: 9:00 AM - 5:30 PM</li>
                <li>Friday: 9:00 AM - 6:00 PM</li>
                <li>Saturday: 11:00 AM - 5:00 PM</li>
                <li className="break-all">
                  E-mail:{" "}
                  <a
                    href="mailto:NguyenDangNguyen1606@gmail.com"
                    className="text-[#0156FF] hover:underline"
                  >
                    NguyenDangNguyen1606@gmail.com
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20">
          <div className="container mx-auto px-4 max-w-[1400px] flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
            <div className="flex items-center gap-4 text-white/50">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
            <div className="flex items-center gap-2.5">
              {paymentIcons.map((p, i) => (
                <img key={i} src={p} alt="Payment method" className="h-5" />
              ))}
            </div>
            <p className="text-[12px] text-white/60">
              Copyright © 2026 Shop Pty. Ltd.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
