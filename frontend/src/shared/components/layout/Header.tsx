import React from "react";
import Link from "next/link";
import { Button } from "../ui/button";
import {
  ChevronDown,
  Clock,
  MapPin,
  Facebook,
  Instagram,
  Search,
  ShoppingCart,
  User,
  X,
} from "lucide-react";

// Dữ liệu tĩnh, tương tự file dataHeader.ts của bạn
const headerData = {
  openHours: "9:00 AM - 5:30 PM",
  address: "19 Nguyễn Du, P7, Gò Vấp, TPHCM",
  phone: "0987556203",
  email: "NguyenDangNguyen1606@gmail.com",
  logoUrl: "/assets/image/Logo.jpg", // Bạn cần đảm bảo có ảnh này trong thư mục public
  navItems: [
    { url: "/laptops", name: "Laptops" },
    { url: "/desktops", name: "Desktop PCs" },
    { url: "/networking", name: "Networking Devices" },
    { url: "/printers", name: "Printers & Scanners" },
    { url: "/pc-parts", name: "PC Parts" },
    { url: "/other-products", name: "All Other Products" },
    { url: "/repairs", name: "Repairs" },
  ],
};

const Header = () => {
  // TODO: Thêm state cho isSearch, isShopInfoOpen, isCartOpen
  const isSearch = false; // Placeholder

  return (
    <header className="bg-white shadow-md">
      {/* Top Bar */}
      <div className="bg-black text-gray-400">
        <div className="container mx-auto flex items-center justify-between py-2.5 text-xs font-semibold">
          <div className="relative group">
            <div className="flex items-center cursor-pointer">
              <span>
                Mon-Thu:{" "}
                <span className="text-white">{headerData.openHours}</span>
              </span>
              <ChevronDown className="w-4 h-4 ml-1 text-white transition-transform group-hover:rotate-180" />
            </div>
            {/* TODO: Logic hiển thị dropdown */}
            <div className="absolute top-full left-0 mt-2 w-72 bg-white text-black shadow-lg rounded-md p-4 z-10 hidden group-hover:block">
              <div className="absolute -top-2 left-4 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-b-8 border-b-white"></div>
              <div className="flex items-start mb-3">
                <Clock className="w-8 h-8 mr-3 text-gray-600" />
                <div>
                  <p className="font-bold">We are open:</p>
                  <p className="text-gray-500">
                    Mon-Thu: {headerData.openHours}
                  </p>
                  <p className="text-gray-500">Fr: 9:00 AM - 6:00 PM</p>
                  <p className="text-gray-500">Sat: 11:00 AM - 5:00 PM</p>
                </div>
              </div>
              <hr className="my-2" />
              <div className="flex items-start mb-3">
                <MapPin className="w-5 h-5 mr-3 text-gray-600 mt-1" />
                <p>{headerData.address}</p>
              </div>
              <hr className="my-2" />
              <div>
                <p>
                  Phone:{" "}
                  <a href={`tel:${headerData.phone}`} className="text-blue-600">
                    {headerData.phone}
                  </a>
                </p>
                <p>
                  Email:{" "}
                  <a
                    href={`mailto:${headerData.email}`}
                    className="text-blue-600"
                  >
                    {headerData.email}
                  </a>
                </p>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            Visit our showroom in {headerData.address} |{" "}
            <a
              href={`tel:${headerData.phone}`}
              className="text-white underline"
            >
              Contact Us
            </a>
          </div>
          <div className="flex items-center gap-2">
            <span>Call Us: {headerData.phone}</span>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Facebook className="w-4 h-4 text-white" />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Instagram className="w-4 h-4 text-white" />
            </a>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto flex items-center justify-between py-3">
        <Link href="/">
          {/* Giả sử logo nằm trong public/assets/image/Logo.jpg */}
          <img src={headerData.logoUrl} alt="Logo" className="h-16 w-auto" />
        </Link>

        {isSearch ? (
          <div className="flex-grow mx-8 relative">
            <input
              type="text"
              placeholder="Search entiere store here..."
              className="w-full border-2 border-gray-300 rounded-full py-3 px-5 focus:outline-none focus:border-blue-500"
            />
            <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>
        ) : (
          <nav className="hidden lg:flex items-center gap-1 mx-4">
            {headerData.navItems.map((item) => (
              <Link
                key={item.name}
                href={item.url}
                className="px-3 py-2 rounded-full font-semibold text-sm hover:bg-gray-100 transition-colors"
              >
                {item.name}
              </Link>
            ))}
            <Link
              href="/our-deals"
              className="px-7 py-1.5 rounded-full font-semibold text-sm text-blue-600 border-2 border-blue-600 hover:bg-blue-50 transition-colors"
            >
              Our Deals
            </Link>
          </nav>
        )}

        <div className="flex items-center gap-5">
          <button>
            {isSearch ? (
              <X className="w-6 h-6" />
            ) : (
              <Search className="w-6 h-6" />
            )}
          </button>

          <div className="relative group">
            <button className="relative">
              <ShoppingCart className="w-7 h-7" />
              {/* TODO: Lấy số lượng từ state */}
              <span className="absolute -top-1 -right-2 bg-blue-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                0
              </span>
            </button>
            {/* TODO: Logic hiển thị dropdown giỏ hàng */}
            <div className="absolute top-full right-0 mt-2 w-80 bg-white shadow-lg rounded-md p-4 z-10 hidden group-hover:block">
              <div className="absolute -top-2 right-4 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-b-8 border-b-gray-200"></div>
              <h3 className="font-bold text-lg">My Cart</h3>
              <p className="text-sm text-gray-500 mb-4">0 item in cart</p>
              <Button
                asChild
                className="w-full border-blue-600 text-blue-600"
                variant="outline"
              >
                <Link href="/cart">View or Edit Your Cart</Link>
              </Button>
              {/* TODO: Map qua các sản phẩm trong giỏ hàng */}
              <div className="mt-4">
                <p className="text-center text-gray-400">Your cart is empty.</p>
              </div>
              <hr className="my-3" />
              <div className="flex justify-between font-bold">
                <span>Subtotal:</span>
                <span>0đ</span>
              </div>
              <Button className="w-full mt-3 bg-blue-600 hover:bg-blue-700">
                Go to Checkout
              </Button>
            </div>
          </div>

          <button>
            <User className="w-7 h-7" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
