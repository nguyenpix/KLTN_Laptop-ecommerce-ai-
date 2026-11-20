import React from "react";
import { Star, ShoppingCart, Heart, CheckCircle2, PhoneCall, BarChart2, Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/shared/components/ui/badge";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { Product } from "@/features/products/types";
import { toast } from "sonner";

interface ProductCardProps {
  product: Product;
  layout?: "grid" | "list";
  badge?: string;
}

const ProductCard = ({ product, layout = "grid", badge }: ProductCardProps) => {
  const { isInWishlist, toggleWishlist } = useWishlistStore();
  if (!product || !product.images || !product.images.mainImg) {
    return null;
  }

  const isWishlisted = isInWishlist(product._id);
  const inStock = (product as Product & { stock?: number }).stock !== 0;
  const price = Number(product.price || 0);
  const oldPrice = Math.round(price * 1.15);

  const renderStars = (rating: number = 4) => {
    const stars: React.ReactNode[] = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-[13px] h-[13px] ${
            i <= rating
              ? "fill-[#E9A426] text-[#E9A426]"
              : "fill-[#CACDD8] text-[#CACDD8]"
          }`}
        />
      );
    }
    return stars;
  };

  // ══════════════════════════════════════════════════════════════════════
  // LIST VIEW — Figma "Catalog - List view - 1" (node 187:124)
  // ══════════════════════════════════════════════════════════════════════
  if (layout === "list") {
    const specsRows = [
      { label: "CPU", value: product.specifications?.cpu || "N/A" },
      { label: "Featured", value: product.specifications?.gpu || product.specifications?.display || "N/A" },
      { label: "RAM / SSD", value: [product.specifications?.ram, product.specifications?.storage || product.specifications?.storage_capacity].filter(Boolean).join(" / ") || "N/A" },
    ];

    return (
      <div className="group bg-white px-6 py-7 transition-shadow hover:shadow-[0px_5px_15px_rgba(0,0,0,0.14)] relative border-b border-[#CACDD8]/60">
        {/* Top-right Stock Indicator */}
        <div className="flex items-center justify-end gap-1.5 mb-2">
          {inStock ? (
            <span className="inline-flex items-center gap-1.5 text-[10px] text-[#78A962] font-normal">
              <CheckCircle2 className="w-3.5 h-3.5 fill-[#78A962] text-white" />
              in stock
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-[10px] text-[#C94D3F] font-normal">
              <PhoneCall className="w-3.5 h-3.5 text-[#C94D3F]" />
              check availability
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Left: Product Image + Rating */}
          <div className="md:col-span-3 flex flex-col items-center">
            <Link href={`/products/${product._id}`} className="relative w-[180px] h-[180px] block mb-4">
              <Image
                src={product.images.mainImg.url}
                alt={product.images.mainImg.alt_text || product.name}
                fill
                className="object-contain"
              />
            </Link>
            <div className="flex items-center gap-2 self-start">
              <div className="flex items-center gap-0.5">{renderStars(4)}</div>
              <span className="text-[12px] text-[#A2A6B0]">Reviews (4)</span>
            </div>
          </div>

          {/* Center: SKU, Title, Price & Add To Cart Pill */}
          <div className="md:col-span-5 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <p className="text-[12px] text-[#666666] uppercase">
                SKU {product.sku || product.part_number || "D5515AI"}
              </p>
              <Link
                href={`/products/${product._id}`}
                className="text-[13px] text-black hover:text-[#0156FF] leading-relaxed line-clamp-3 block"
              >
                {product.title || product.name}
              </Link>
            </div>

            <div className="flex items-baseline gap-2.5 pt-1">
              <span className="text-[14px] text-[#666666] line-through">
                {oldPrice.toLocaleString("vi-VN")} ₫
              </span>
              <span className="text-[18px] font-semibold text-black">
                {price.toLocaleString("vi-VN")} ₫
              </span>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => useCartStore.getState().addToCart(product, 1)}
                className="inline-flex items-center gap-2.5 border-2 border-[#0156FF] text-[#0156FF] hover:bg-[#0156FF] hover:text-white rounded-full px-6 py-2 text-[14px] font-semibold transition-colors"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Add To Cart</span>
              </button>
            </div>
          </div>

          {/* Right: Mini Spec Table & Action Icons */}
          <div className="md:col-span-4 flex flex-col justify-between h-full space-y-6">
            <div className="w-full text-[12px]">
              {specsRows.map((row, idx) => (
                <div
                  key={row.label}
                  className={`grid grid-cols-3 py-2 px-3.5 ${
                    idx % 2 === 1 ? "bg-[#F5F7FF]" : "bg-white"
                  }`}
                >
                  <span className="text-black font-normal">{row.label}</span>
                  <span className="col-span-2 text-[#666666] line-clamp-1">{row.value}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => toggleWishlist(product._id)}
                className={`w-[30px] h-[30px] rounded-full border-2 flex items-center justify-center transition-colors ${
                  isWishlisted
                    ? "border-red-500 bg-red-50 text-red-500"
                    : "border-[#A2A6B0] text-[#A2A6B0] hover:border-[#0156FF] hover:text-[#0156FF]"
                }`}
                aria-label="Add to wishlist"
              >
                <Heart className={`w-3.5 h-3.5 ${isWishlisted ? "fill-red-500" : ""}`} />
              </button>
              <button
                type="button"
                onClick={() => toast.info("Đã thêm vào danh sách so sánh")}
                className="w-[30px] h-[30px] rounded-full border-2 border-[#A2A6B0] text-[#A2A6B0] hover:border-[#0156FF] hover:text-[#0156FF] flex items-center justify-center transition-colors"
                aria-label="Compare"
              >
                <BarChart2 className="w-3.5 h-3.5" />
              </button>
              <Link
                href="/contact"
                className="w-[30px] h-[30px] rounded-full border-2 border-[#A2A6B0] text-[#A2A6B0] hover:border-[#0156FF] hover:text-[#0156FF] flex items-center justify-center transition-colors"
                aria-label="Contact"
              >
                <Mail className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════
  // GRID VIEW — Figma "Product Card - 1" (121:16844) & "Hover - 1" (642:11380)
  // ══════════════════════════════════════════════════════════════════════
  return (
    <div className="group bg-white px-5 py-4 flex flex-col justify-between relative transition-all duration-200 hover:shadow-[0px_5px_15px_rgba(0,0,0,0.14)] hover:z-10">
      {/* Top Row: Stock status (left) + AI Match Badge (optional) */}
      <div className="flex items-center justify-between min-h-[26px] mb-1">
        {inStock ? (
          <span className="inline-flex items-center gap-1.5 text-[10px] text-[#78A962]">
            <CheckCircle2 className="w-3 h-3 fill-[#78A962] text-white" />
            in stock
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-[10px] text-[#C94D3F]">
            <PhoneCall className="w-3 h-3 text-[#C94D3F]" />
            check availability
          </span>
        )}

        {badge && (
          <Badge className="bg-[#0156FF] hover:bg-[#0156FF] text-white text-[10px] px-2 py-0.5 font-semibold">
            {badge}
          </Badge>
        )}
      </div>

      {/* Hover Action Icons (Top Right - Figma Hover-1) */}
      <div className="absolute top-3 right-3 z-20 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product._id);
          }}
          className={`w-[30px] h-[30px] rounded-full border-2 bg-white flex items-center justify-center transition-colors ${
            isWishlisted
              ? "border-red-500 text-red-500"
              : "border-[#A2A6B0] text-[#A2A6B0] hover:border-[#0156FF] hover:text-[#0156FF]"
          }`}
          aria-label="Add to wishlist"
        >
          <Heart className={`w-3.5 h-3.5 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`} />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            toast.info("Đã thêm vào danh sách so sánh");
          }}
          className="w-[30px] h-[30px] rounded-full border-2 border-[#A2A6B0] bg-white text-[#A2A6B0] hover:border-[#0156FF] hover:text-[#0156FF] flex items-center justify-center transition-colors"
          aria-label="Compare"
        >
          <BarChart2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Product Image (150x150 centered on white) */}
      <Link href={`/products/${product._id}`} className="relative w-[150px] h-[150px] mx-auto my-2 block">
        <Image
          src={product.images.mainImg.url}
          alt={product.images.mainImg.alt_text || product.name}
          fill
          className="object-contain transition-transform duration-300 group-hover:scale-105"
        />
      </Link>

      {/* Rating Row */}
      <div className="flex items-center gap-2 my-2">
        <div className="flex items-center gap-0.5">{renderStars(4)}</div>
        <span className="text-[12px] text-[#A2A6B0]">Reviews (4)</span>
      </div>

      {/* Product Title */}
      <Link
        href={`/products/${product._id}`}
        className="text-[13px] text-black hover:text-[#0156FF] leading-[1.45] line-clamp-3 min-h-[56px] mb-2 block"
      >
        {product.title || product.name}
      </Link>

      {/* Price Block */}
      <div className="mb-3">
        <p className="text-[14px] text-[#666666] line-through leading-[1.4]">
          {oldPrice.toLocaleString("vi-VN")} ₫
        </p>
        <p className="text-[18px] font-semibold text-black leading-[1.4]">
          {price.toLocaleString("vi-VN")} ₫
        </p>
      </div>

      {/* Add To Cart Outlined Pill Button (Figma Hover - 1) */}
      <div className="pt-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-200">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            useCartStore.getState().addToCart(product, 1);
          }}
          className="w-full border-2 border-[#0156FF] text-[#0156FF] hover:bg-[#0156FF] hover:text-white rounded-full py-2 px-4 text-[14px] font-semibold inline-flex items-center justify-center gap-2 transition-colors"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Add To Cart</span>
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
