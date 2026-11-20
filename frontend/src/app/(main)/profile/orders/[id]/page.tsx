"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { API_URL } from "@/constants/api-url";
import AccountSidebar from "@/shared/components/layout/AccountSidebar";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

interface ProductImage {
  url: string;
  alt_text?: string;
}

interface Product {
  _id: string;
  title?: string;
  name: string;
  price: number;
  images?: { mainImg?: ProductImage };
  brand_id?: { name: string };
}

interface OrderItem {
  _id: string;
  laptop_id: Product | null;
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
  items: OrderItem[];
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

const toNum = (v: unknown): number => {
  if (typeof v === "number") return v;
  if (
    v &&
    typeof v === "object" &&
    "$numberDecimal" in (v as Record<string, unknown>)
  ) {
    return parseFloat((v as Record<string, string>).$numberDecimal) || 0;
  }
  return parseFloat(String(v ?? 0)) || 0;
};

export default function OrderDetailPage() {
  const { token, isLoggedIn } = useAuthStore();
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const orderId = params.id as string;

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
    data: Order;
  }>({
    queryKey: ["orderDetail", orderId],
    queryFn: async () => {
      if (!token) throw new Error("No authentication token found.");
      if (!orderId) throw new Error("Order ID is missing.");

      const response = await fetch(`${API_URL}/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to fetch order details");
      }
      return response.json();
    },
    enabled: !!token && !!orderId,
  });

  const cancelMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`${API_URL}/orders/${orderId}/cancel`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      const resBody = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(resBody.message || "Không thể hủy đơn hàng");
      }
      return resBody;
    },
    onSuccess: () => {
      toast.success("Đã hủy đơn hàng thành công");
      queryClient.invalidateQueries({ queryKey: ["orderDetail", orderId] });
      queryClient.invalidateQueries({ queryKey: ["myOrders"] });
    },
    onError: (err: unknown) => {
      toast.error(
        err instanceof Error ? err.message : "Lỗi khi hủy đơn hàng"
      );
    },
  });

  if (!isLoggedIn) {
    return (
      <div className="container mx-auto py-16 text-center text-[14px] text-[#A2A6B0]">
        Đang chuyển hướng...
      </div>
    );
  }

  const order = data?.data;
  const orderItems = order?.items || [];
  const subtotal = orderItems.reduce(
    (sum, item) => sum + toNum(item.price) * item.quantity,
    0
  );

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
          <Link href="/profile/orders" className="hover:text-[#0156FF]">
            My Orders
          </Link>
          <span className="text-[#0156FF]">›</span>
          <span className="text-[#A2A6B0]">
            Order #{orderId?.slice(-8).toUpperCase()}
          </span>
        </nav>

        <div className="flex flex-wrap items-center justify-between gap-4 mb-7">
          <h1 className="text-[32px] font-semibold text-black">
            Order #{orderId?.slice(-8).toUpperCase()}
          </h1>

          <div className="flex items-center gap-3">
            <Link
              href="/profile/orders"
              className="h-[38px] px-6 rounded-[50px] border-2 border-[#A2A6B0] text-[#A2A6B0] hover:border-black hover:text-black text-[13px] font-semibold flex items-center justify-center transition-colors"
            >
              ‹ Back to My Orders
            </Link>
            {order?.status === "pending" && (
              <button
                type="button"
                disabled={cancelMutation.isPending}
                onClick={() => {
                  if (
                    window.confirm("Bạn có chắc muốn hủy đơn hàng này không?")
                  ) {
                    cancelMutation.mutate();
                  }
                }}
                className="h-[38px] px-6 rounded-[50px] bg-[#C94D3F] hover:bg-red-700 text-white text-[13px] font-semibold transition-colors disabled:opacity-50"
              >
                {cancelMutation.isPending ? "Đang hủy..." : "Hủy đơn hàng"}
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 items-start">
          {/* Left Figma Dashboard Sidebar */}
          <AccountSidebar activeSection="orders" />

          {/* Right Content */}
          <div className="flex-1 w-full space-y-8">
            {isLoading ? (
              <div className="py-12 text-center text-[14px] text-[#A2A6B0]">
                Đang tải chi tiết đơn hàng...
              </div>
            ) : isError || !order ? (
              <div className="bg-[#F5F7FF] p-12 text-center">
                <p className="text-[16px] text-[#C94D3F] font-medium mb-4">
                  {error?.message || "Không tìm thấy đơn hàng."}
                </p>
                <Link
                  href="/profile/orders"
                  className="inline-flex items-center justify-center h-[40px] px-7 rounded-[50px] bg-[#0156FF] text-white text-[14px] font-semibold"
                >
                  Quay lại lịch sử đơn hàng
                </Link>
              </div>
            ) : (
              <>
                {/* Order Information Grid (Figma User Account 2-Column style) */}
                <div>
                  <div className="border-b border-[#CACDD8] pb-3 mb-6 flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-[18px] font-bold text-black">
                      Order Information
                    </h2>
                    <span
                      className={`inline-flex items-center px-3.5 py-1 rounded-[50px] border text-[12px] font-semibold ${
                        STATUS_COLORS[order.status]
                      }`}
                    >
                      {STATUS_LABELS[order.status] || order.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-[14px] text-[#666666] leading-[22px]">
                    <div className="bg-[#F5F7FF] p-6">
                      <h3 className="text-[16px] font-semibold text-black mb-2">
                        Shipping Address
                      </h3>
                      <p className="text-black font-medium">
                        {order.user_id?.name}
                      </p>
                      <p>{order.shipping_address}</p>
                      <p className="mt-2 text-[13px] text-[#A2A6B0]">
                        Order Date:{" "}
                        {new Date(order.createdAt).toLocaleString("vi-VN")}
                      </p>
                    </div>

                    <div className="bg-[#F5F7FF] p-6">
                      <h3 className="text-[16px] font-semibold text-black mb-2">
                        Payment Method
                      </h3>
                      <p className="text-black font-medium">
                        {order.payment_method === "cod"
                          ? "Thanh toán khi nhận hàng (Cash on Delivery)"
                          : "Ví điện tử / Chuyển khoản trực tuyến"}
                      </p>
                      <p className="mt-2">
                        Order ID:{" "}
                        <span className="font-mono text-[13px] text-black">
                          {order._id}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Items Ordered Table (Figma Shopping Cart style) */}
                <div>
                  <div className="border-b border-[#CACDD8] pb-3 mb-4">
                    <h2 className="text-[18px] font-bold text-black">
                      Items Ordered ({orderItems.length})
                    </h2>
                  </div>

                  <div className="divide-y divide-[#CACDD8]">
                    {orderItems.map((item) => {
                      const unitPrice = toNum(item.price);
                      const imgUrl =
                        item.laptop_id?.images?.mainImg?.url ||
                        "/placeholder.png";
                      const productName =
                        item.laptop_id?.title ||
                        item.laptop_id?.name ||
                        "Sản phẩm đã ngừng kinh doanh";
                      const brandName = item.laptop_id?.brand_id?.name || "";

                      return (
                        <div
                          key={item._id}
                          className="py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-4 flex-1">
                            <div className="w-[80px] h-[80px] flex-shrink-0 border border-[#CACDD8] p-1 flex items-center justify-center bg-white">
                              <img
                                src={imgUrl}
                                alt={productName}
                                className="max-w-full max-h-full object-contain"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              {brandName && (
                                <span className="text-[11px] font-bold uppercase text-[#A2A6B0]">
                                  {brandName}
                                </span>
                              )}
                              {item.laptop_id?._id ? (
                                <Link
                                  href={`/products/${item.laptop_id._id}`}
                                  className="block text-[14px] font-medium text-black hover:text-[#0156FF] line-clamp-2"
                                >
                                  {productName}
                                </Link>
                              ) : (
                                <p className="text-[14px] font-medium text-black">
                                  {productName}
                                </p>
                              )}
                              <p className="text-[13px] text-[#666666] mt-1">
                                Đơn giá: {unitPrice.toLocaleString("vi-VN")} ₫ ×{" "}
                                <span className="font-semibold text-black">
                                  {item.quantity}
                                </span>
                              </p>
                            </div>
                          </div>

                          <div className="text-right font-semibold text-[16px] text-black">
                            {(unitPrice * item.quantity).toLocaleString(
                              "vi-VN"
                            )}{" "}
                            ₫
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Order Totals Box (#F5F7FF - Figma Summary style) */}
                <div className="flex justify-end">
                  <div className="w-full md:w-[420px] bg-[#F5F7FF] p-6 space-y-3 text-[13px] font-semibold text-black">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>{subtotal.toLocaleString("vi-VN")} ₫</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping &amp; Handling</span>
                      <span>Miễn phí</span>
                    </div>
                    <div className="border-t border-[#CACDD8] pt-3 flex justify-between items-center">
                      <span className="text-[15px]">Order Total</span>
                      <span className="text-[18px] text-[#0156FF]">
                        {toNum(order.total_amount).toLocaleString("vi-VN")} ₫
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
