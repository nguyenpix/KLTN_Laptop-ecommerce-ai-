"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  RecommendationsList,
  recommendationsAPI,
} from "@/features/recommendations";
import type { UserInteraction } from "@/features/recommendations/types";
import { useAuthStore } from "@/store/authStore";
import AccountSidebar from "@/shared/components/layout/AccountSidebar";
import {
  Eye,
  ShoppingCart,
  Heart,
  Star,
  ShoppingBag,
  Clock,
  RefreshCw,
} from "lucide-react";

const INTERACTION_META: Record<
  string,
  {
    label: string;
    badgeClass: string;
    icon: React.ComponentType<{ className?: string }>;
    defaultWeight: number;
  }
> = {
  view: {
    label: "Xem sản phẩm",
    badgeClass: "bg-[#F5F7FF] text-[#0156FF] border-[#0156FF]",
    icon: Eye,
    defaultWeight: 1.0,
  },
  like: {
    label: "Yêu thích",
    badgeClass: "bg-pink-50 text-pink-700 border-pink-300",
    icon: Heart,
    defaultWeight: 3.0,
  },
  add_to_cart: {
    label: "Thêm vào giỏ",
    badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-300",
    icon: ShoppingCart,
    defaultWeight: 5.0,
  },
  rating: {
    label: "Đánh giá sao",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-300",
    icon: Star,
    defaultWeight: 8.0,
  },
  purchase: {
    label: "Mua hàng",
    badgeClass: "bg-emerald-50 text-[#78A962] border-[#78A962]",
    icon: ShoppingBag,
    defaultWeight: 10.0,
  },
};

const FILTER_TABS = [
  { key: "all", label: "Tất cả" },
  { key: "view", label: "Xem sản phẩm" },
  { key: "add_to_cart", label: "Thêm vào giỏ" },
  { key: "like", label: "Yêu thích" },
  { key: "rating", label: "Đánh giá" },
  { key: "purchase", label: "Mua hàng" },
];

export default function ProfileRecommendationsPage() {
  const { isLoggedIn, token, user } = useAuthStore();
  const [selectedType, setSelectedType] = useState<string>("all");
  const [page, setPage] = useState<number>(1);
  const limit = 10;

  const {
    data: historyData,
    isLoading: isLoadingHistory,
    refetch: refetchHistory,
  } = useQuery({
    queryKey: ["userInteractionsHistory", user?.id, selectedType, page],
    queryFn: () =>
      recommendationsAPI.getUserInteractions({
        page,
        limit,
        type: selectedType,
      }),
    enabled: !!isLoggedIn && !!token,
  });

  const interactions: UserInteraction[] =
    historyData?.data?.interactions || [];
  const stats = historyData?.data?.stats;
  const pagination = historyData?.data?.pagination;

  const renderInteractionDetail = (item: UserInteraction) => {
    const parts: string[] = [];
    if (item.type === "view" && item.metadata?.duration) {
      parts.push(`Thời gian xem: ${item.metadata.duration}s`);
    }
    if (item.type === "rating" && item.metadata?.rating_value) {
      parts.push(`Chấm điểm: ${item.metadata.rating_value}/5 sao`);
    }
    if (
      (item.type === "add_to_cart" || item.type === "purchase") &&
      item.metadata?.quantity
    ) {
      parts.push(`SL: ${item.metadata.quantity}`);
    }
    if (item.metadata?.source) {
      parts.push(`Nguồn: ${String(item.metadata.source)}`);
    }
    return parts.join(" • ");
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-6 max-w-[1400px]">
        {/* Breadcrumb */}
        <nav className="text-[12px] text-black mb-4 flex items-center gap-1.5">
          <Link href="/" className="hover:text-[#0156FF]">
            Home
          </Link>
          <span className="text-[#0156FF]">›</span>
          <Link href="/profile" className="hover:text-[#0156FF]">
            My Dashboard
          </Link>
          <span className="text-[#0156FF]">›</span>
          <span className="text-[#A2A6B0]">
            AI Recommendations &amp; Lịch sử tương tác
          </span>
        </nav>

        {/* Page Title */}
        <h1 className="text-[32px] font-semibold text-black mb-7">
          AI Recommendations &amp; Lịch sử tương tác
        </h1>

        <div className="flex flex-col lg:flex-row gap-12 items-start">
          {/* Left Figma Dashboard Sidebar */}
          <AccountSidebar activeSection="recommendations" />

          {/* Right Main Content */}
          <div className="flex-1 w-full space-y-12">
            {/* Section 1: AI Personalized Recommendations */}
            <section>
              <div className="border-b border-[#CACDD8] pb-3 mb-6">
                <h2 className="text-[18px] font-bold text-black">
                  Gợi ý sản phẩm dành riêng cho bạn (Dual-Tower AI)
                </h2>
              </div>
              <RecommendationsList
                limit={8}
                title="Laptop phù hợp nhất với hồ sơ của bạn"
                showMetadata={true}
              />
            </section>

            {/* Section 2: User Interaction History */}
            <section>
              <div className="border-b border-[#CACDD8] pb-3 mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-[18px] font-bold text-black">
                    Lịch sử tương tác của người dùng
                  </h2>
                  <p className="text-[13px] text-[#666666] mt-0.5">
                    Các hoạt động xem, yêu thích, thêm giỏ hàng, đánh giá và mua
                    sắm dùng để huấn luyện Vector hồ sơ AI của bạn.
                  </p>
                </div>

                {isLoggedIn && (
                  <button
                    type="button"
                    onClick={() => refetchHistory()}
                    className="h-[36px] px-5 rounded-[50px] border-2 border-[#0156FF] text-[#0156FF] hover:bg-[#0156FF] hover:text-white text-[13px] font-semibold inline-flex items-center gap-1.5 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Làm mới
                  </button>
                )}
              </div>

              {!isLoggedIn ? (
                <div className="bg-[#F5F7FF] p-10 text-center">
                  <p className="text-[14px] text-black mb-4">
                    Vui lòng đăng nhập để xem lịch sử tương tác cá nhân của bạn.
                  </p>
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center h-[40px] px-8 rounded-[50px] bg-[#0156FF] text-white text-[14px] font-semibold"
                  >
                    Sign In
                  </Link>
                </div>
              ) : (
                <>
                  {/* Summary Stats Cards (#F5F7FF Figma boxes) */}
                  {stats && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
                      <div className="bg-[#F5F7FF] p-4">
                        <p className="text-[11px] font-semibold text-[#A2A6B0] uppercase">
                          Tổng tương tác
                        </p>
                        <p className="text-[22px] font-bold text-black mt-1">
                          {stats.total}
                        </p>
                      </div>
                      <div className="bg-[#F5F7FF] p-4">
                        <p className="text-[11px] font-semibold text-[#0156FF] uppercase">
                          Lượt xem (1x)
                        </p>
                        <p className="text-[22px] font-bold text-[#0156FF] mt-1">
                          {stats.byType?.view ?? 0}
                        </p>
                      </div>
                      <div className="bg-[#F5F7FF] p-4">
                        <p className="text-[11px] font-semibold text-indigo-600 uppercase">
                          Thêm giỏ (5x)
                        </p>
                        <p className="text-[22px] font-bold text-indigo-700 mt-1">
                          {stats.byType?.add_to_cart ?? 0}
                        </p>
                      </div>
                      <div className="bg-[#F5F7FF] p-4">
                        <p className="text-[11px] font-semibold text-pink-600 uppercase">
                          Yêu thích (3x)
                        </p>
                        <p className="text-[22px] font-bold text-pink-700 mt-1">
                          {stats.byType?.like ?? 0}
                        </p>
                      </div>
                      <div className="bg-[#F5F7FF] p-4">
                        <p className="text-[11px] font-semibold text-amber-600 uppercase">
                          Đánh giá (8x)
                        </p>
                        <p className="text-[22px] font-bold text-amber-700 mt-1">
                          {stats.byType?.rating ?? 0}
                        </p>
                      </div>
                      <div className="bg-[#F5F7FF] p-4">
                        <p className="text-[11px] font-semibold text-[#78A962] uppercase">
                          Mua hàng (10x)
                        </p>
                        <p className="text-[22px] font-bold text-[#78A962] mt-1">
                          {stats.byType?.purchase ?? 0}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Filter Pill Tabs */}
                  <div className="flex flex-wrap items-center gap-2 mb-6">
                    {FILTER_TABS.map((tab) => {
                      const active = selectedType === tab.key;
                      return (
                        <button
                          key={tab.key}
                          type="button"
                          onClick={() => {
                            setSelectedType(tab.key);
                            setPage(1);
                          }}
                          className={`h-[36px] px-5 rounded-[50px] text-[13px] font-semibold transition-colors ${
                            active
                              ? "bg-[#0156FF] text-white"
                              : "bg-[#F5F7FF] text-black hover:border hover:border-[#0156FF]"
                          }`}
                        >
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Interaction List */}
                  {isLoadingHistory ? (
                    <div className="py-12 text-center text-[14px] text-[#A2A6B0]">
                      Đang tải lịch sử tương tác...
                    </div>
                  ) : interactions.length === 0 ? (
                    <div className="bg-[#F5F7FF] p-10 text-center text-[14px] text-[#666666]">
                      Chưa có tương tác nào trong mục này.
                    </div>
                  ) : (
                    <div className="divide-y divide-[#CACDD8] border-t border-b border-[#CACDD8]">
                      {interactions.map((item) => {
                        const meta = INTERACTION_META[item.type] || {
                          label: item.type,
                          badgeClass:
                            "bg-[#F5F7FF] text-black border-[#CACDD8]",
                          icon: Eye,
                          defaultWeight: item.weight || 1,
                        };
                        const IconComponent = meta.icon;
                        const prod = item.productId;
                        const prodImg = prod?.images?.mainImg?.url || "/placeholder.png";
                        const prodName = prod?.title || prod?.name || "Laptop";
                        const prodBrand =
                          typeof prod?.brand_id === "object"
                            ? prod?.brand_id?.name
                            : prod?.brand_id;
                        const detailText = renderInteractionDetail(item);

                        return (
                          <div
                            key={item._id}
                            className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#F5F7FF]/50 transition-colors px-2"
                          >
                            <div className="flex items-center gap-4">
                              {prod ? (
                                <Link
                                  href={`/products/${prod._id}`}
                                  className="w-[62px] h-[62px] border border-[#CACDD8] bg-white p-1 flex items-center justify-center flex-shrink-0"
                                >
                                  <img
                                    src={prodImg}
                                    alt={prodName}
                                    className="max-w-full max-h-full object-contain"
                                  />
                                </Link>
                              ) : (
                                <div className="w-[62px] h-[62px] bg-[#F5F7FF] flex items-center justify-center text-[11px] text-[#A2A6B0] flex-shrink-0">
                                  Đã xóa
                                </div>
                              )}

                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                  <span
                                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[50px] border text-[11px] font-semibold ${meta.badgeClass}`}
                                  >
                                    <IconComponent className="w-3 h-3" />
                                    {meta.label}
                                  </span>
                                  <span className="text-[11px] font-semibold text-[#A2A6B0]">
                                    Trọng số AI: +{item.weight ?? meta.defaultWeight}
                                  </span>
                                  {prodBrand && (
                                    <span className="text-[11px] font-bold text-black uppercase">
                                      • {prodBrand}
                                    </span>
                                  )}
                                </div>

                                {prod ? (
                                  <Link
                                    href={`/products/${prod._id}`}
                                    className="text-[14px] font-medium text-black hover:text-[#0156FF] line-clamp-1"
                                  >
                                    {prodName}
                                  </Link>
                                ) : (
                                  <p className="text-[14px] text-[#A2A6B0] italic">
                                    Sản phẩm không còn tồn tại
                                  </p>
                                )}

                                <div className="flex flex-wrap items-center gap-3 mt-0.5 text-[12px] text-[#666666]">
                                  {prod && prod.price > 0 && (
                                    <span className="font-semibold text-black">
                                      {Number(prod.price).toLocaleString(
                                        "vi-VN"
                                      )}{" "}
                                      ₫
                                    </span>
                                  )}
                                  {detailText && <span>{detailText}</span>}
                                </div>
                              </div>
                            </div>

                            <div className="flex sm:flex-col items-end justify-between gap-2 flex-shrink-0 text-right">
                              <span className="inline-flex items-center gap-1 text-[12px] text-[#A2A6B0]">
                                <Clock className="w-3.5 h-3.5" />
                                {new Date(item.createdAt).toLocaleString(
                                  "vi-VN"
                                )}
                              </span>
                              {prod && (
                                <Link
                                  href={`/products/${prod._id}`}
                                  className="text-[12px] font-semibold text-[#0156FF] underline hover:opacity-80"
                                >
                                  Xem lại sản phẩm →
                                </Link>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Pagination */}
                  {pagination && pagination.pages > 1 && (
                    <div className="flex items-center justify-between pt-6">
                      <p className="text-[13px] text-[#A2A6B0]">
                        Trang {pagination.current} / {pagination.pages} (Tổng{" "}
                        {pagination.total} tương tác)
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={page <= 1}
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                          className="h-[36px] px-5 rounded-[50px] border-2 border-[#A2A6B0] text-[#A2A6B0] hover:border-black hover:text-black disabled:opacity-40 text-[13px] font-semibold"
                        >
                          ‹ Trước
                        </button>
                        <button
                          type="button"
                          disabled={page >= pagination.pages}
                          onClick={() =>
                            setPage((p) => Math.min(pagination.pages, p + 1))
                          }
                          className="h-[36px] px-5 rounded-[50px] border-2 border-[#A2A6B0] text-[#A2A6B0] hover:border-black hover:text-black disabled:opacity-40 text-[13px] font-semibold"
                        >
                          Sau ›
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
