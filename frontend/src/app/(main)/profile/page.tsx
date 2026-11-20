"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuthStore } from "@/store/authStore";
import { API_URL } from "@/constants/api-url";
import AccountSidebar from "@/shared/components/layout/AccountSidebar";
import { toast } from "sonner";

const profileSchema = z.object({
  name: z.string().min(1, "Vui lòng nhập họ tên"),
  phone: z.string().optional(),
  address: z.string().optional(),
  avatar_url: z
    .string()
    .url("URL ảnh không hợp lệ")
    .optional()
    .or(z.literal("")),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  avatar_url?: string;
  role: string;
}

export default function ProfilePage() {
  const { token, isLoggedIn } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<"dashboard" | "info" | "address">(
    "dashboard"
  );
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      !isLoggedIn &&
      !localStorage.getItem("token")
    ) {
      router.push("/login");
    }
  }, [isLoggedIn, router]);

  const {
    data: userProfile,
    isLoading,
    isError,
    error,
  } = useQuery<UserProfile>({
    queryKey: ["userProfile"],
    queryFn: async () => {
      if (!token) throw new Error("No authentication token found.");
      const response = await fetch(`${API_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to fetch profile");
      }
      const resData = await response.json();
      return resData.data;
    },
    enabled: !!token,
  });

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      phone: "",
      address: "",
      avatar_url: "",
    },
  });

  useEffect(() => {
    if (userProfile) {
      form.reset({
        name: userProfile.name || "",
        phone: userProfile.phone || "",
        address: userProfile.address || "",
        avatar_url: userProfile.avatar_url || "",
      });
    }
  }, [userProfile, form]);

  const updateProfileMutation = useMutation({
    mutationFn: async (updatedProfile: ProfileFormValues) => {
      if (!token) throw new Error("No authentication token found.");
      const response = await fetch(`${API_URL}/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedProfile),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update profile");
      }
      const resData = await response.json();
      return resData.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["userProfile"], data);
      useAuthStore.getState().setUser({
        id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
        phone: data.phone,
        address: data.address,
        avatar_url: data.avatar_url,
      });
      setIsEditing(false);
      toast.success("Cập nhật thông tin tài khoản thành công!");
    },
    onError: (err: unknown) => {
      toast.error(
        err instanceof Error ? err.message : "Cập nhật thông tin thất bại."
      );
    },
  });

  const onSubmit = (values: ProfileFormValues) => {
    updateProfileMutation.mutate(values);
  };

  if (!isLoggedIn) {
    return (
      <div className="container mx-auto py-16 text-center text-[14px] text-[#A2A6B0]">
        Đang chuyển hướng...
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-16 text-center text-[14px] text-[#A2A6B0]">
        Đang tải thông tin tài khoản...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto py-16 text-center text-[14px] text-[#C94D3F]">
        Lỗi: {error?.message || "Không thể tải thông tin."}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-6 max-w-[1400px]">
        {/* Breadcrumb - Figma User Account - 1 (Node 137:115) */}
        <nav className="text-[12px] text-black mb-4 flex items-center gap-1.5">
          <Link href="/" className="hover:text-[#0156FF]">
            Home
          </Link>
          <span className="text-[#0156FF]">›</span>
          <span className="text-[#A2A6B0]">My Dashboard</span>
        </nav>

        {/* Page Title */}
        <h1 className="text-[32px] font-semibold text-black mb-7">
          My Dashboard
        </h1>

        <div className="flex flex-col lg:flex-row gap-12 items-start">
          {/* Left Sidebar (326px - Figma Node 146:49) */}
          <AccountSidebar
            activeSection={activeTab}
            onSelectSection={(sec) => {
              setActiveTab(sec);
              if (sec !== "dashboard") setIsEditing(true);
            }}
          />

          {/* Right Main Dashboard Content - Figma Node 137:115 */}
          <div className="flex-1 w-full space-y-12">
            {/* Account Information Section */}
            <section>
              <div className="border-b border-[#CACDD8] pb-3 mb-6">
                <h2 className="text-[18px] font-bold text-black">
                  Account Information
                </h2>
              </div>

              {isEditing ? (
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="bg-[#F5F7FF] p-7 max-w-[680px] space-y-5"
                >
                  <h3 className="text-[16px] font-semibold text-black">
                    Edit Account &amp; Address Information
                  </h3>

                  <div>
                    <label className="block text-[13px] font-semibold text-black mb-2">
                      Full Name <span className="text-[#C94D3F]">*</span>
                    </label>
                    <input
                      type="text"
                      {...form.register("name")}
                      className="w-full h-[50px] px-4 rounded-[4px] border border-[#CACDD8] bg-white text-[14px] text-black focus:outline-none focus:border-[#0156FF]"
                    />
                    {form.formState.errors.name && (
                      <p className="text-[12px] text-[#C94D3F] mt-1">
                        {form.formState.errors.name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[13px] font-semibold text-black mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={userProfile?.email || ""}
                      disabled
                      className="w-full h-[50px] px-4 rounded-[4px] border border-[#CACDD8] bg-gray-100 text-[14px] text-[#A2A6B0] cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-[13px] font-semibold text-black mb-2">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      {...form.register("phone")}
                      placeholder="Nhập số điện thoại"
                      className="w-full h-[50px] px-4 rounded-[4px] border border-[#CACDD8] bg-white text-[14px] text-black focus:outline-none focus:border-[#0156FF]"
                    />
                  </div>

                  <div>
                    <label className="block text-[13px] font-semibold text-black mb-2">
                      Default Billing / Shipping Address
                    </label>
                    <input
                      type="text"
                      {...form.register("address")}
                      placeholder="Nhập địa chỉ nhận hàng mặc định"
                      className="w-full h-[50px] px-4 rounded-[4px] border border-[#CACDD8] bg-white text-[14px] text-black focus:outline-none focus:border-[#0156FF]"
                    />
                  </div>

                  <div>
                    <label className="block text-[13px] font-semibold text-black mb-2">
                      Avatar URL
                    </label>
                    <input
                      type="text"
                      {...form.register("avatar_url")}
                      placeholder="https://example.com/avatar.jpg"
                      className="w-full h-[50px] px-4 rounded-[4px] border border-[#CACDD8] bg-white text-[14px] text-black focus:outline-none focus:border-[#0156FF]"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={updateProfileMutation.isPending}
                      className="h-[44px] px-8 rounded-[50px] bg-[#0156FF] hover:bg-blue-700 text-white text-[14px] font-semibold transition-colors disabled:opacity-50"
                    >
                      {updateProfileMutation.isPending
                        ? "Saving..."
                        : "Save Changes"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="h-[44px] px-7 rounded-[50px] border-2 border-[#A2A6B0] text-[#A2A6B0] hover:border-black hover:text-black text-[14px] font-semibold transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {/* Contact Information */}
                  <div>
                    <h3 className="text-[16px] font-semibold text-black mb-3">
                      Contact Information
                    </h3>
                    <div className="text-[16px] font-light text-[#666666] leading-[22px] space-y-1 mb-5">
                      <p>{userProfile?.name}</p>
                      <p>{userProfile?.email}</p>
                      {userProfile?.phone && <p>Tel: {userProfile.phone}</p>}
                    </div>
                    <div className="flex items-center gap-6 text-[14px]">
                      <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="text-[#0156FF] underline hover:opacity-80"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="text-[#0156FF] underline hover:opacity-80"
                      >
                        Change Password
                      </button>
                    </div>
                  </div>

                  {/* Newsletters */}
                  <div>
                    <h3 className="text-[16px] font-semibold text-black mb-3">
                      Newsletters
                    </h3>
                    <p className="text-[16px] font-light text-[#666666] leading-[22px] mb-5">
                      You don&apos;t subscribe to our newsletter.
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        toast.success("Đã đăng ký nhận bản tin khuyến mãi!")
                      }
                      className="text-[14px] text-[#0156FF] underline hover:opacity-80"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              )}
            </section>

            {/* Address Book Section */}
            <section>
              <div className="border-b border-[#CACDD8] pb-3 mb-6 flex items-baseline gap-5">
                <h2 className="text-[18px] font-bold text-black">
                  Address Book
                </h2>
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="text-[14px] text-[#0156FF] underline hover:opacity-80"
                >
                  Manage Addresses
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Default Billing Address */}
                <div>
                  <h3 className="text-[16px] font-semibold text-black mb-3">
                    Default Billing Address
                  </h3>
                  <p className="text-[16px] font-light text-[#666666] leading-[22px] mb-5">
                    {userProfile?.address ||
                      "You have not set a default billing address."}
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="text-[14px] text-[#0156FF] underline hover:opacity-80"
                  >
                    Edit Address
                  </button>
                </div>

                {/* Default Shipping Address */}
                <div>
                  <h3 className="text-[16px] font-semibold text-black mb-3">
                    Default Shipping Address
                  </h3>
                  <p className="text-[16px] font-light text-[#666666] leading-[22px] mb-5">
                    {userProfile?.address ||
                      "You have not set a default shipping address."}
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="text-[14px] text-[#0156FF] underline hover:opacity-80"
                  >
                    Edit Address
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
