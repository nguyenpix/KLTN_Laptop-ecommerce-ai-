"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore, getUserId } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useCategories } from "@/features/products/hook/useCategories";
import { useBrands } from "@/features/products/hook/useBrands";
import { useProducts } from "@/features/products/hook/useProducts";
import ProductCard from "@/features/products/components/ProductCard";
import { Product } from "@/features/products/types";
import {
  ChevronDown,
  ChevronRight,
  Clock,
  MapPin,
  Search,
  ShoppingCart,
  X,
  Pencil,
  User as UserIcon,
} from "lucide-react";

const shopInfoData = {
  openHours: "9:00 AM - 5:30 PM",
  fridayHours: "9:00 AM - 6:00 PM",
  saturdayHours: "11:00 AM - 5:00 PM",
  address: "19 Nguyễn Du, P7, Gò Vấp, TPHCM",
  phone: "0987 556 203",
  email: "NguyenDangNguyen1606@gmail.com",
  logoUrl: "/assets/image/Logo.jpg",
};

const brandLogos = [
  { name: "Lenovo", logo: "/assets/image/logo_lenovo.png" },
  { name: "Msi", logo: "/assets/image/logo msi.png" },
  { name: "Dell", logo: "/assets/image/logo dell.png" },
  { name: "Acer", logo: "/assets/image/logo_acer.png" },
];

const Header = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoggedIn, user, logout } = useAuthStore();
  const {
    items,
    getTotalItems,
    getTotalPrice,
    loadCartFromServer,
    removeFromCart,
  } = useCartStore();
  const {
    getTotalItems: getTotalWishlistItems,
    loadWishlistFromServer,
  } = useWishlistStore();

  const { data: categoriesData } = useCategories();
  const { data: brandsData } = useBrands();
  const categories: Array<{ _id: string; name: string }> =
    categoriesData?.data || [];
  const brands: Array<{ _id: string; name: string; slug?: string }> =
    brandsData?.data || [];

  const [isClient, setIsClient] = useState(false);
  const [isSearch, setIsSearch] = useState(false);
  const [keyword, setKeyword] = useState("");

  // Mega menu states (Figma Menu - 1 / Hovered Menu - 1)
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [hoveredCategoryId, setHoveredCategoryId] = useState<string>("");
  const [hoveredBrandId, setHoveredBrandId] = useState<string>("");

  // Fetch 4 preview products from database for the Mega Menu based on hovered Category / Brand
  const { data: megaProductsData } = useProducts({
    limit: 4,
    ...(hoveredCategoryId ? { category: hoveredCategoryId } : {}),
    ...(hoveredBrandId ? { brand: hoveredBrandId } : {}),
  });
  const megaProducts: Product[] = megaProductsData?.data || [];

  const userId = getUserId(user);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Mỗi khi tài khoản thay đổi -> tải lại giỏ hàng & wishlist của đúng user đó
  useEffect(() => {
    if (isLoggedIn && userId) {
      loadCartFromServer();
      loadWishlistFromServer();
    }
  }, [isLoggedIn, userId, loadCartFromServer, loadWishlistFromServer]);

  // Đóng mega menu khi chuyển trang
  useEffect(() => {
    setIsMegaMenuOpen(false);
  }, [pathname]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = keyword.trim();
    router.push(q ? `/products?search=${encodeURIComponent(q)}` : "/products");
    setIsSearch(false);
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const getBrandIdByName = (name: string) => {
    const found = brands.find(
      (b) => b.name.toLowerCase() === name.toLowerCase()
    );
    return found?._id || "";
  };

  const cartCount = isClient ? getTotalItems() : 0;
  const wishlistCount = isClient ? getTotalWishlistItems() : 0;
  const cartSubtotal = isClient ? getTotalPrice() : 0;

  return (
    <header className="bg-white border-b border-[#CACDD8] relative z-40">
      {/* Top Black Bar - Figma Node 63:968 (h-[44px] bg-[#020202]) */}
      <div className="bg-[#020202] text-[#A2A6B0] h-[44px] flex items-center">
        <div className="container mx-auto px-4 max-w-[1400px] flex items-center justify-between text-[12px] font-semibold">
          {/* Left: Opening Hours + Shop Info Dropdown (Figma Node 642:11316) */}
          <div className="relative group py-2">
            <button
              type="button"
              className="flex items-center gap-1.5 cursor-pointer focus:outline-none"
            >
              <span className="text-[#A2A6B0]">Mon-Thu:</span>
              <span className="text-white">{shopInfoData.openHours}</span>
              <ChevronDown className="w-3.5 h-3.5 text-white transition-transform duration-200 group-hover:rotate-180" />
            </button>

            {/* Figma Shop Info Popup (262px) */}
            <div className="absolute top-full left-0 mt-1 w-[262px] bg-white text-black border border-[#CACDD8] shadow-[0px_5px_15px_rgba(0,0,0,0.14)] z-50 hidden group-hover:block font-normal">
              {/* Top Pointer Triangle */}
              <div className="absolute -top-[7px] left-6 w-3 h-3 bg-white border-l border-t border-[#CACDD8] rotate-45" />

              {/* Section 1: Open Hours */}
              <div className="p-3.5 border-b border-[#CACDD8] flex items-start gap-3">
                <div className="w-[35px] h-[35px] rounded-full border-2 border-[#0156FF] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Clock className="w-4 h-4 text-[#0156FF]" />
                </div>
                <div className="text-[13px] leading-[1.4]">
                  <p className="text-[12px] text-black mb-1">We are open:</p>
                  <p className="font-semibold">
                    <span className="text-[#A2A6B0]">Mon-Thu: </span>
                    <span className="text-black">{shopInfoData.openHours}</span>
                  </p>
                  <p className="font-semibold mt-0.5">
                    <span className="text-[#A2A6B0]">Fr: </span>
                    <span className="text-black">{shopInfoData.fridayHours}</span>
                  </p>
                  <p className="font-semibold mt-0.5">
                    <span className="text-[#A2A6B0]">Sat: </span>
                    <span className="text-black">{shopInfoData.saturdayHours}</span>
                  </p>
                </div>
              </div>

              {/* Section 2: Address */}
              <div className="p-3.5 border-b border-[#CACDD8] flex items-start gap-3">
                <div className="w-[35px] h-[35px] rounded-full border-2 border-[#0156FF] flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 text-[#0156FF]" />
                </div>
                <p className="text-[13px] text-black leading-[1.4]">
                  Address: {shopInfoData.address}
                </p>
              </div>

              {/* Section 3: Phone & Email */}
              <div className="p-3.5 space-y-1 text-[13px]">
                <p>
                  <span className="text-black">Phones: </span>
                  <a
                    href={`tel:${shopInfoData.phone.replace(/\s+/g, "")}`}
                    className="text-[#0156FF] hover:underline"
                  >
                    {shopInfoData.phone}
                  </a>
                </p>
                <p className="truncate">
                  <span className="text-black">E-mail: </span>
                  <a
                    href={`mailto:${shopInfoData.email}`}
                    className="text-[#0156FF] hover:underline"
                  >
                    {shopInfoData.email}
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Center: Showroom Address + Contact Us Link */}
          <div className="hidden md:flex items-center gap-2 text-[#ACACAC]">
            <span>
              Visit our showroom in {shopInfoData.address}
            </span>
            <Link
              href="/contact"
              className="text-white border-b-2 border-white pb-0.5 hover:text-[#0156FF] hover:border-[#0156FF] transition-colors"
            >
              Contact Us
            </Link>
          </div>

          {/* Right: Call Us + Social Icons */}
          <div className="flex items-center gap-3.5 text-white">
            <span>Call Us: {shopInfoData.phone}</span>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="hover:opacity-80 transition-opacity"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" />
              </svg>
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="hover:opacity-80 transition-opacity"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Main White Header - Figma Node 63:968 & 63:1059 (h-[92px]) */}
      <div
        className="container mx-auto px-4 max-w-[1400px] h-[92px] flex items-center justify-between relative"
        onMouseLeave={() => setIsMegaMenuOpen(false)}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <img
            src={shopInfoData.logoUrl}
            alt="Logo"
            className="h-14 w-auto object-contain"
          />
        </Link>

        {/* Center: Either Search Pill (Figma 63:1059) or Dynamic Navigation Bar (Figma 63:968) */}
        {isSearch ? (
          <form
            onSubmit={handleSearchSubmit}
            className="flex-1 mx-6 lg:mx-12 h-[60px] bg-[#F5F7FF] rounded-[31px] px-7 flex items-center justify-between"
          >
            <input
              type="text"
              autoFocus
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search entire store here..."
              className="w-full bg-transparent text-[14px] text-black placeholder:text-[#A2A6B0] focus:outline-none"
            />
            <button
              type="submit"
              aria-label="Tìm kiếm"
              className="text-black hover:text-[#0156FF] transition-colors ml-3"
            >
              <Search className="w-5 h-5" />
            </button>
          </form>
        ) : (
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 mx-4">
            {/* Main "Laptops" trigger with Figma Mega Menu */}
            <div
              onMouseEnter={() => {
                setIsMegaMenuOpen(true);
              }}
            >
              <Link
                href="/products"
                className={`inline-flex items-center justify-center h-[37px] px-5 rounded-[100px] text-[14px] font-semibold transition-colors ${
                  isMegaMenuOpen
                    ? "bg-[#0156FF] text-white"
                    : "text-black hover:bg-[#0156FF] hover:text-white"
                }`}
              >
                Laptops
              </Link>
            </div>

            {/* Dynamic Categories from Project Database (Gaming, Business, Student, Creative, Ultrabook) */}
            {categories.map((cat) => (
              <Link
                key={cat._id}
                href={`/products?category=${cat._id}`}
                onMouseEnter={() => {
                  setHoveredCategoryId(cat._id);
                  setIsMegaMenuOpen(true);
                }}
                className="inline-flex items-center justify-center h-[37px] px-4 rounded-[100px] text-[14px] font-semibold text-black hover:bg-[#0156FF] hover:text-white transition-colors"
              >
                {cat.name}
              </Link>
            ))}

            {/* Static Figma Informational Pages */}
            <Link
              href="/about"
              onMouseEnter={() => setIsMegaMenuOpen(false)}
              className="inline-flex items-center justify-center h-[37px] px-4 rounded-[100px] text-[14px] font-semibold text-black hover:bg-[#F5F7FF] hover:text-[#0156FF] transition-colors"
            >
              About Us
            </Link>

            {/* Figma "Our Deals" Pill Button */}
            <Link
              href="/products?tags=New"
              onMouseEnter={() => setIsMegaMenuOpen(false)}
              className="ml-1 inline-flex items-center justify-center h-[37px] px-[26px] rounded-[50px] border-2 border-[#0156FF] text-[#0156FF] text-[14px] font-semibold hover:bg-[#0156FF] hover:text-white transition-colors"
            >
              Our Deals
            </Link>
          </nav>
        )}

        {/* Right Icons: Search Toggle, Mini-Cart, Account Avatar */}
        <div
          className="flex items-center gap-6 flex-shrink-0"
          onMouseEnter={() => setIsMegaMenuOpen(false)}
        >
          {/* Search / Close Button (Blue X when open per Figma 63:1059) */}
          <button
            type="button"
            onClick={() => setIsSearch((v) => !v)}
            aria-label="Tìm kiếm"
            className="flex items-center justify-center focus:outline-none"
          >
            {isSearch ? (
              <X className="w-6 h-6 text-[#0156FF]" />
            ) : (
              <Search className="w-5 h-5 text-black hover:text-[#0156FF] transition-colors" />
            )}
          </button>

          {/* Mini-Cart Icon & Dropdown - Figma Node 57:765 (w-[310px]) */}
          <div className="relative group py-2">
            <Link
              href="/cart"
              className="relative flex items-center justify-center text-black hover:text-[#0156FF] transition-colors"
            >
              <ShoppingCart className="w-6 h-6" />
              <span className="absolute -top-2 -right-2.5 bg-[#0156FF] text-white text-[10px] font-bold rounded-full w-[18px] h-[18px] flex items-center justify-center">
                {cartCount}
              </span>
            </Link>

            {/* Figma Minicart - 1 Popup */}
            <div className="absolute top-full right-0 mt-1 w-[310px] bg-white border border-[#CACDD8] shadow-[0px_5px_15px_rgba(0,0,0,0.14)] z-50 hidden group-hover:block">
              {/* Top Pointer Triangle */}
              <div className="absolute -top-[7px] right-4 w-3 h-3 bg-white border-l border-t border-[#CACDD8] rotate-45" />

              {/* Header */}
              <div className="pt-6 pb-4 px-6 text-center">
                <h3 className="text-[18px] font-semibold text-black leading-[1.4]">
                  My Cart
                </h3>
                <p className="text-[12px] text-[#A2A6B0] mt-0.5 mb-4">
                  {cartCount} {cartCount === 1 ? "item" : "items"} in cart
                </p>
                <Link
                  href="/cart"
                  className="w-[250px] h-[37px] mx-auto rounded-[50px] border-2 border-[#0156FF] text-[#0156FF] text-[14px] font-semibold flex items-center justify-center hover:bg-[#0156FF] hover:text-white transition-colors"
                >
                  View or Edit Your Cart
                </Link>
              </div>

              {/* Cart Items List */}
              <div className="border-t border-[#CACDD8] max-h-[240px] overflow-y-auto divide-y divide-[#CACDD8]">
                {!isClient || items.length === 0 ? (
                  <p className="py-8 text-center text-[13px] text-[#A2A6B0]">
                    Your cart is empty.
                  </p>
                ) : (
                  items.map((item) => {
                    if (!item?.product) return null;
                    const imgUrl =
                      item.product.images?.mainImg?.url || "/placeholder.png";
                    const title = item.product.title || item.product.name;

                    return (
                      <div
                        key={item.product._id}
                        className="px-4 py-3.5 flex items-center gap-3"
                      >
                        {/* Qty: "1 x" */}
                        <div className="text-black whitespace-nowrap flex-shrink-0 w-7 text-center">
                          <span className="text-[18px] font-normal">
                            {item.quantity}
                          </span>{" "}
                          <span className="text-[14px]">x</span>
                        </div>

                        {/* Product Image 65x65 */}
                        <Link
                          href={`/products/${item.product._id}`}
                          className="w-[65px] h-[65px] flex-shrink-0 relative flex items-center justify-center"
                        >
                          <img
                            src={imgUrl}
                            alt={title}
                            className="max-w-full max-h-full object-contain"
                          />
                        </Link>

                        {/* Product Title */}
                        <Link
                          href={`/products/${item.product._id}`}
                          className="flex-1 min-w-0 text-[13px] text-black leading-snug line-clamp-3 hover:text-[#0156FF]"
                        >
                          {title}
                        </Link>

                        {/* Stacked Action Circles (Remove X & Edit Pencil) */}
                        <div className="flex flex-col gap-1.5 flex-shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              removeFromCart(item.product._id);
                            }}
                            aria-label="Xóa sản phẩm"
                            title="Xóa"
                            className="w-[20px] h-[20px] rounded-full border-2 border-[#CACDD8] text-[#A2A6B0] hover:border-[#C94D3F] hover:text-[#C94D3F] flex items-center justify-center transition-colors"
                          >
                            <X className="w-2.5 h-2.5 stroke-[2.5]" />
                          </button>
                          <Link
                            href={`/products/${item.product._id}`}
                            aria-label="Xem sản phẩm"
                            title="Chi tiết"
                            className="w-[20px] h-[20px] rounded-full border-2 border-[#CACDD8] text-[#A2A6B0] hover:border-[#0156FF] hover:text-[#0156FF] flex items-center justify-center transition-colors"
                          >
                            <Pencil className="w-2.5 h-2.5" />
                          </Link>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer: Subtotal + Checkout Buttons */}
              <div className="border-t border-[#CACDD8] pt-4 pb-6 px-6 text-center">
                <p className="font-semibold mb-4">
                  <span className="text-[14px] text-[#A2A6B0]">Subtotal: </span>
                  <span className="text-[18px] text-black">
                    {cartSubtotal.toLocaleString("vi-VN")} ₫
                  </span>
                </p>

                <Link
                  href={isLoggedIn ? "/checkout" : "/login"}
                  className="w-[250px] h-[37px] mx-auto rounded-[50px] bg-[#0156FF] hover:bg-blue-700 text-white text-[14px] font-semibold flex items-center justify-center transition-colors"
                >
                  Go to Checkout
                </Link>

                <Link
                  href={isLoggedIn ? "/checkout" : "/login"}
                  className="w-[250px] h-[37px] mx-auto mt-2 rounded-[50px] bg-[#FFB800] hover:bg-[#f2ae00] text-[#232C65] text-[12px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>Check out with</span>
                  <span className="font-extrabold italic text-[14px] tracking-tight">
                    PayPal
                  </span>
                </Link>
              </div>
            </div>
          </div>

          {/* Account Avatar & Dropdown - Figma Node 642:11379 (w-[232px]) */}
          <div className="relative group py-2">
            <Link
              href={isLoggedIn ? "/profile" : "/login"}
              className="w-[36px] h-[36px] rounded-full overflow-hidden border border-[#CACDD8] bg-[#F5F7FF] flex items-center justify-center text-[#0156FF] font-semibold text-[14px]"
            >
              {isClient && isLoggedIn && user ? (
                user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{user.name?.charAt(0)?.toUpperCase() || "U"}</span>
                )
              ) : (
                <UserIcon className="w-5 h-5 text-black" />
              )}
            </Link>

            {/* Figma Account - 1 Dropdown */}
            <div className="absolute top-full right-0 mt-1 w-[232px] bg-white border border-[#CACDD8] shadow-[0px_5px_15px_rgba(0,0,0,0.14)] z-50 hidden group-hover:block py-4 px-[26px]">
              {/* Top Pointer Triangle */}
              <div className="absolute -top-[7px] right-3 w-3 h-3 bg-white border-l border-t border-[#CACDD8] rotate-45" />

              <ul className="text-[14px] font-medium text-black leading-[2.1]">
                <li>
                  <Link
                    href={isLoggedIn ? "/profile" : "/login"}
                    className="block hover:text-[#0156FF] transition-colors"
                  >
                    My Account
                  </Link>
                </li>
                <li>
                  <Link
                    href="/wishlist"
                    className="block hover:text-[#0156FF] transition-colors"
                  >
                    My Wish List ({wishlistCount})
                  </Link>
                </li>
                <li>
                  <Link
                    href="/products"
                    className="block hover:text-[#0156FF] transition-colors"
                  >
                    Compare (0)
                  </Link>
                </li>
                {isClient && isLoggedIn ? (
                  <>
                    <li>
                      <Link
                        href="/profile/orders"
                        className="block hover:text-[#0156FF] transition-colors"
                      >
                        My Orders
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/profile/recommendations"
                        className="block hover:text-[#0156FF] transition-colors"
                      >
                        AI Recommendations
                      </Link>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full text-left text-[#C94D3F] hover:underline transition-colors"
                      >
                        Sign Out
                      </button>
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <Link
                        href="/register"
                        className="block hover:text-[#0156FF] transition-colors"
                      >
                        Create an Account
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/login"
                        className="block hover:text-[#0156FF] transition-colors"
                      >
                        Sign In
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Figma Mega Menu Dropdown - Node 59:740 & 65:467 (1398px width) */}
        {isMegaMenuOpen && !isSearch && (
          <div
            onMouseEnter={() => setIsMegaMenuOpen(true)}
            onMouseLeave={() => setIsMegaMenuOpen(false)}
            className="hidden lg:block absolute top-full left-4 right-4 bg-white border border-[#CACDD8] shadow-[0px_5px_15px_rgba(0,0,0,0.1)] z-50"
          >
            <div className="flex min-h-[370px]">
              {/* Column 1: Database Categories (310px) */}
              <div className="w-[290px] border-r border-[#CACDD8] py-2 flex-shrink-0">
                <Link
                  href="/products"
                  onMouseEnter={() => {
                    setHoveredCategoryId("");
                    setHoveredBrandId("");
                  }}
                  className={`h-[44px] px-7 flex items-center justify-between text-[14px] font-semibold text-black transition-colors ${
                    hoveredCategoryId === "" ? "bg-[#F5F7FF]" : "hover:bg-[#F5F7FF]"
                  }`}
                >
                  <span>Everyday Use Notebooks</span>
                  <ChevronRight className="w-4 h-4 text-black" />
                </Link>
                {categories.map((cat) => (
                  <Link
                    key={cat._id}
                    href={`/products?category=${cat._id}`}
                    onMouseEnter={() => {
                      setHoveredCategoryId(cat._id);
                      setHoveredBrandId("");
                    }}
                    className={`h-[44px] px-7 flex items-center justify-between text-[14px] font-semibold text-black transition-colors ${
                      hoveredCategoryId === cat._id
                        ? "bg-[#F5F7FF]"
                        : "hover:bg-[#F5F7FF]"
                    }`}
                  >
                    <span>{cat.name} Notebooks</span>
                    <ChevronRight className="w-4 h-4 text-black" />
                  </Link>
                ))}
              </div>

              {/* Column 2: Database Brands Submenu (240px) */}
              <div className="w-[230px] border-r border-[#CACDD8] py-2 flex-shrink-0">
                <Link
                  href={
                    hoveredCategoryId
                      ? `/products?category=${hoveredCategoryId}`
                      : "/products"
                  }
                  onMouseEnter={() => setHoveredBrandId("")}
                  className={`h-[40px] px-6 flex items-center justify-between text-[14px] font-semibold text-black transition-colors ${
                    hoveredBrandId === "" ? "bg-[#F5F7FF]" : "hover:bg-[#F5F7FF]"
                  }`}
                >
                  <span>All Brands</span>
                  <ChevronRight className="w-3.5 h-3.5 text-black" />
                </Link>
                {brands.map((brand) => (
                  <Link
                    key={brand._id}
                    href={
                      hoveredCategoryId
                        ? `/products?category=${hoveredCategoryId}&brand=${brand._id}`
                        : `/products?brand=${brand._id}`
                    }
                    onMouseEnter={() => setHoveredBrandId(brand._id)}
                    className={`h-[40px] px-6 flex items-center justify-between text-[14px] font-normal text-black transition-colors ${
                      hoveredBrandId === brand._id
                        ? "bg-[#F5F7FF] font-semibold"
                        : "hover:bg-[#F5F7FF]"
                    }`}
                  >
                    <span>{brand.name} Series</span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#A2A6B0]" />
                  </Link>
                ))}
              </div>

              {/* Right Area: 4 Live Product Cards from Database */}
              <div className="flex-1 p-5 grid grid-cols-4 gap-2 items-start">
                {megaProducts.slice(0, 4).map((product) => (
                  <div key={product._id} onClick={() => setIsMegaMenuOpen(false)}>
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Strip: Brand Logos from Database */}
            <div className="border-t border-[#CACDD8] bg-white px-6 py-4 grid grid-cols-4 md:grid-cols-7 gap-4 items-center">
              {brandLogos.map((b) => {
                const bId = getBrandIdByName(b.name);
                return (
                  <Link
                    key={b.name}
                    href={bId ? `/products?brand=${bId}` : "/products"}
                    onClick={() => setIsMegaMenuOpen(false)}
                    className="h-[75px] flex items-center justify-center p-3 hover:bg-[#F5F7FF] transition-colors grayscale hover:grayscale-0 opacity-80 hover:opacity-100"
                  >
                    <Image
                      src={b.logo}
                      alt={b.name}
                      width={130}
                      height={55}
                      className="object-contain max-h-[50px]"
                    />
                  </Link>
                );
              })}
              {brands
                .filter(
                  (b) =>
                    !["lenovo", "msi", "dell", "acer"].includes(
                      b.name.toLowerCase()
                    )
                )
                .slice(0, 3)
                .map((b) => (
                  <Link
                    key={b._id}
                    href={`/products?brand=${b._id}`}
                    onClick={() => setIsMegaMenuOpen(false)}
                    className="h-[75px] flex items-center justify-center p-3 hover:bg-[#F5F7FF] transition-colors text-[16px] font-bold text-[#A2A6B0] hover:text-black uppercase tracking-wider"
                  >
                    {b.name}
                  </Link>
                ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
