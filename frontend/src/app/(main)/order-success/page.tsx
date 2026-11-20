"use client";

import Link from "next/link";
import { Check } from "lucide-react";

export default function OrderSuccessPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12 max-w-[1400px]">
        {/* Breadcrumb */}
        <nav className="text-[12px] text-black mb-4 flex items-center gap-1.5">
          <Link href="/" className="hover:text-[#0156FF]">
            Home
          </Link>
          <span className="text-[#0156FF]">›</span>
          <span className="text-[#A2A6B0]">Order Success</span>
        </nav>

        <div className="max-w-[680px] mx-auto bg-[#F5F7FF] p-10 md:p-14 text-center my-8">
          <div className="w-[65px] h-[65px] rounded-full bg-[#78A962] text-white flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 stroke-[3]" />
          </div>

          <h1 className="text-[32px] font-semibold text-black mb-3">
            Thank You For Your Purchase!
          </h1>

          <p className="text-[14px] text-[#666666] leading-[22px] mb-8 max-w-[480px] mx-auto">
            Đơn hàng của bạn đã được ghi nhận thành công và đang được hệ thống xử
            lý. Bạn có thể theo dõi trạng thái đơn hàng trong mục quản lý tài
            khoản.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/products"
              className="h-[50px] px-8 rounded-[50px] bg-[#0156FF] hover:bg-blue-700 text-white text-[14px] font-semibold inline-flex items-center justify-center transition-colors"
            >
              Continue Shopping
            </Link>
            <Link
              href="/profile/orders"
              className="h-[50px] px-8 rounded-[50px] border-2 border-[#0156FF] text-[#0156FF] hover:bg-[#0156FF] hover:text-white text-[14px] font-semibold inline-flex items-center justify-center transition-colors"
            >
              View My Orders
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
