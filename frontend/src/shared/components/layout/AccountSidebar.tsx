"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWishlistStore } from "@/store/wishlistStore";

interface AccountSidebarProps {
  activeSection?: "dashboard" | "info" | "address" | "orders" | "wishlist" | "recommendations";
  onSelectSection?: (section: "dashboard" | "info" | "address") => void;
}

export default function AccountSidebar({
  activeSection,
  onSelectSection,
}: AccountSidebarProps) {
  const pathname = usePathname();
  const { items: wishlistItems } = useWishlistStore();
  const validWishlistCount = wishlistItems.filter(
    (item) => item && item.product_id && item.product_id._id
  ).length;

  const currentTab =
    activeSection ||
    (pathname?.startsWith("/profile/orders")
      ? "orders"
      : pathname?.startsWith("/profile/recommendations")
      ? "recommendations"
      : pathname?.startsWith("/wishlist")
      ? "wishlist"
      : "dashboard");

  const menuGroup1 = [
    {
      key: "dashboard" as const,
      label: "Account Dashboard",
      href: "/profile",
      isInternal: !!onSelectSection,
    },
    {
      key: "info" as const,
      label: "Account Information",
      href: "/profile",
      isInternal: !!onSelectSection,
    },
    {
      key: "address" as const,
      label: "Address Book",
      href: "/profile",
      isInternal: !!onSelectSection,
    },
    {
      key: "orders" as const,
      label: "My Orders",
      href: "/profile/orders",
      isInternal: false,
    },
  ];

  const menuGroup2 = [
    {
      key: "wishlist" as const,
      label: "My Wish List",
      href: "/wishlist",
    },
    {
      key: "reviews" as const,
      label: "My Product Reviews",
      href: "/profile/orders",
    },
  ];

  const menuGroup3 = [
    {
      key: "recommendations" as const,
      label: "AI Recommendations & Lịch sử",
      href: "/profile/recommendations",
    },
  ];

  return (
    <aside className="w-full lg:w-[326px] flex-shrink-0 space-y-2">
      {/* Main Navigation Box (#F5F7FF - Figma Node 146:49) */}
      <div className="bg-[#F5F7FF] py-4">
        <ul className="space-y-1">
          {menuGroup1.map((item) => {
            const isActive = currentTab === item.key;
            return (
              <li key={item.key} className="relative">
                {isActive && (
                  <span className="absolute left-0 top-1 bottom-1 w-[3px] bg-[#0156FF] rounded-r" />
                )}
                {item.isInternal && onSelectSection && item.key !== "orders" ? (
                  <button
                    type="button"
                    onClick={() => onSelectSection(item.key)}
                    className={`w-full text-left px-5 py-2 text-[15px] transition-colors ${
                      isActive
                        ? "font-semibold text-black"
                        : "font-normal text-[#666666] hover:text-black"
                    }`}
                  >
                    {item.label}
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    className={`block px-5 py-2 text-[15px] transition-colors ${
                      isActive
                        ? "font-semibold text-black"
                        : "font-normal text-[#666666] hover:text-black"
                    }`}
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>

        <div className="my-3 mx-4 border-t border-[#CACDD8]" />

        <ul className="space-y-1">
          {menuGroup2.map((item) => {
            const isActive = currentTab === item.key;
            return (
              <li key={item.key} className="relative">
                {isActive && (
                  <span className="absolute left-0 top-1 bottom-1 w-[3px] bg-[#0156FF] rounded-r" />
                )}
                <Link
                  href={item.href}
                  className={`block px-5 py-2 text-[15px] transition-colors ${
                    isActive
                      ? "font-semibold text-black"
                      : "font-normal text-[#666666] hover:text-black"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="my-3 mx-4 border-t border-[#CACDD8]" />

        <ul className="space-y-1">
          {menuGroup3.map((item) => {
            const isActive = currentTab === item.key;
            return (
              <li key={item.key} className="relative">
                {isActive && (
                  <span className="absolute left-0 top-1 bottom-1 w-[3px] bg-[#0156FF] rounded-r" />
                )}
                <Link
                  href={item.href}
                  className={`block px-5 py-2 text-[15px] transition-colors ${
                    isActive
                      ? "font-semibold text-black"
                      : "font-normal text-[#666666] hover:text-black"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Compare Products Box - Figma Node 146:41 */}
      <div className="bg-[#F5F7FF] p-5 text-center">
        <h3 className="text-[16px] font-bold text-black mb-2">
          Compare Products
        </h3>
        <p className="text-[13px] text-black">You have no items to compare.</p>
      </div>

      {/* My Wish List Box - Figma Node 146:45 */}
      <div className="bg-[#F5F7FF] p-5 text-center">
        <h3 className="text-[16px] font-bold text-black mb-2">My Wish List</h3>
        {validWishlistCount === 0 ? (
          <p className="text-[13px] text-black">
            You have no items in your wish list.
          </p>
        ) : (
          <div>
            <p className="text-[13px] text-black mb-3">
              You have{" "}
              <span className="font-semibold text-[#0156FF]">
                {validWishlistCount}
              </span>{" "}
              {validWishlistCount === 1 ? "item" : "items"} in your wish list.
            </p>
            <Link
              href="/wishlist"
              className="inline-flex items-center justify-center h-[34px] px-5 rounded-[50px] border-2 border-[#0156FF] text-[#0156FF] text-[13px] font-semibold hover:bg-[#0156FF] hover:text-white transition-colors"
            >
              View Wish List
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}
