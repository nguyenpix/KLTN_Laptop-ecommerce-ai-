"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { API_URL } from "@/constants/api-url";
import AccountSidebar from "@/shared/components/layout/AccountSidebar";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

interface OrderItem {
  laptop_id: string;
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  user_id: { _id: string; name: string; email: string };
  total_amount: number;
  shipping_address: string;
  payment_method: string;
  status: "pending" | "confirmed" | "shipping" | "delivered" | "cancelled";
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
}

const STATUS_LABELS: Record<Order["status"], string> = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  shipping: "Đang giao",
  delivered: "Đã giao",
  cancelled: "Đã hủy",
};

const STATUS_COLORS: Record<Order["status"], string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-300",
  confirmed: "bg-[#F5F7FF] text-[#0156FF] border-[#0156FF]",
  shipping: "bg-indigo-50 text-indigo-700 border-indigo-300",
  delivered: "bg-emerald-50 text-[#78A962] border-[#78A962]",
  cancelled: "bg-red-50 text-[#C94D3F] border-[#C94D3F]",
};

export default function OrderHistoryPage() {
  const { token, isLoggedIn } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      !isLoggedIn &&
      !localStorage.getItem("token")
    ) {
      router.push("/login");
    }
  }, [isLoggedIn, router]);

  const { data, isLoading, isError, error } = useQuery<{
    success: boolean;
    data: Order[];
    pagination: { current: number; pages: number; total: number };
  }>({
    queryKey: ["myOrders", page],
    queryFn: async () => {
      if (!token) throw new Error("No authentication token found.");
      const response = await fetch(
        `${API_URL}/orders/my-orders?page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to fetch orders");
      }
      return response.json();
    },
    enabled: !!token,
  });

  const cancelMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const response = await fetch(`${API_URL}/orders/${orderId}/cancel`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const resBody = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(resBody.message || "Không thể hủy đơn hàng");
      }
      return resBody;
    },
    onSuccess: () => {
      toast.success("Đã hủy đơn hàng thành công");
      queryClient.invalidateQueries({ queryKey: ["myOrders"] });
    },
    onError: (err: unknown) => {
      toast.error(
        err instanceof Error ? err.message : "Lỗi khi hủy đơn hàng"
      );
    },
  });

  const handleCancelOrder = (orderId: string) => {
    if (window.confirm("Bạn có chắc muốn hủy đơn hàng này không?")) {
      cancelMutation.mutate(orderId);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="container mx-auto py-16 text-center text-[14px] text-[#A2A6B0]">
        Đang chuyển hướng...
      </div>
    );
  }

  const orders = data?.data || [];
  const pagination = data?.pagination;

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
          <span className="text-[#A2A6B0]">My Orders</span>
        </nav>

        <h1 className="text-[32px] font-semibold text-black mb-7">
          My Orders
        </h1>

        <div className="flex flex-col lg:flex-row gap-12 items-start">
          {/* Left Figma Dashboard Sidebar */}
          <AccountSidebar activeSection="orders" />

          {/* Right Content */}
          <div className="flex-1 w-full">
            <div className="border-b border-[#CACDD8] pb-3 mb-6 flex items-center justify-between">
              <h2 className="text-[18px] font-bold text-black">
                Order History
              </h2>
              {pagination && (
                <span className="text-[13px] text-[#A2A6B0]">
                  Total: {pagination.total} orders
                </span>
              )}
            </div>

            {isLoading ? (
              <div className="py-12 text-center text-[14px] text-[#A2A6B0]">
                Đang tải lịch sử đơn hàng...
              </div>
            ) : isError ? (
              <div className="py-12 text-center text-[14px] text-[#C94D3F]">
                Lỗi: {error?.message || "Không thể tải lịch sử đơn hàng."}
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-[#F5F7FF] p-12 text-center">
                <p className="text-[16px] text-black font-medium mb-4">
                  Bạn chưa có đơn hàng nào.
                </p>
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center h-[40px] px-8 rounded-[50px] bg-[#0156FF] hover:bg-blue-700 text-white text-[14px] font-semibold transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#CACDD8] text-[14px] font-semibold text-black">
                        <th className="py-3 pr-4">Order #</th>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Order Total</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 pl-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#CACDD8] text-[14px]">
                      {orders.map((order) => (
                        <tr key={order._id} className="hover:bg-[#F5F7FF]/50">
                          <td className="py-4 pr-4 font-semibold text-black">
                            #{order._id.slice(-8).toUpperCase()}
                            <span className="block text-[11px] font-normal text-[#A2A6B0]">
                              {order._id}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-[#666666]">
                            {new Date(order.createdAt).toLocaleDateString(
                              "vi-VN"
                            )}
                          </td>
                          <td className="py-4 px-4 font-semibold text-black">
                            {Number(order.total_amount || 0).toLocaleString(
                              "vi-VN"
                            )}{" "}
                            ₫
                          </td>
                          <td className="py-4 px-4">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-[50px] border text-[12px] font-semibold ${
                                STATUS_COLORS[order.status]
                              }`}
                            >
                              {STATUS_LABELS[order.status] || order.status}
                            </span>
                          </td>
                          <td className="py-4 pl-4 text-right">
                            <div className="inline-flex items-center gap-3">
                              <Link
                                href={`/profile/orders/${order._id}`}
                                className="text-[13px] font-semibold text-[#0156FF] underline hover:opacity-80"
                              >
                                View Order
                              </Link>
                              {order.status === "pending" && (
                                <button
                                  type="button"
                                  disabled={cancelMutation.isPending}
                                  onClick={() => handleCancelOrder(order._id)}
                                  className="h-[30px] px-4 rounded-[50px] border border-[#C94D3F] text-[#C94D3F] hover:bg-[#C94D3F] hover:text-white text-[12px] font-semibold transition-colors disabled:opacity-50"
                                >
                                  Hủy đơn
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Figma Pill Pagination */}
                {pagination && pagination.pages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <button
                      type="button"
                      onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                      disabled={page === 1}
                      className="w-[38px] h-[38px] rounded-full border-2 border-[#A2A6B0] text-[#A2A6B0] hover:border-black hover:text-black disabled:opacity-40 flex items-center justify-center text-[13px] font-semibold"
                    >
                      ‹
                    </button>
                    {[...Array(pagination.pages)].map((_, index) => {
                      const p = index + 1;
                      const isActive = page === p;
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setPage(p)}
                          className={`w-[38px] h-[38px] rounded-full text-[13px] font-semibold flex items-center justify-center transition-colors ${
                            isActive
                              ? "bg-[#F5F7FF] text-black"
                              : "border-2 border-[#A2A6B0] text-[#A2A6B0] hover:border-black hover:text-black"
                          }`}
                        >
                          {p}
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() =>
                        setPage((prev) =>
                          Math.min(prev + 1, pagination.pages)
                        )
                      }
                      disabled={page === pagination.pages}
                      className="w-[38px] h-[38px] rounded-full border-2 border-[#A2A6B0] text-[#A2A6B0] hover:border-black hover:text-black disabled:opacity-40 flex items-center justify-center text-[13px] font-semibold"
                    >
                      ›
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
