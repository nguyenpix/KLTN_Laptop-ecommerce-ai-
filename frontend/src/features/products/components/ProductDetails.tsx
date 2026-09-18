'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Product } from '@/features/products/types';
import { Button } from '@/shared/components/ui/button';
import { 
  ShoppingCart, 
  Heart, 
  Share2, 
  Truck, 
  RotateCcw, 
  ShieldCheck, 
  Wrench, 
  ChevronRight, 
  Gift, 
  GraduationCap, 
  Sparkles,
  CheckCircle2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { ProductSpecsTable } from './ProductSpecsTable';
import { renderFormattedDescription } from '../utils/formatProductDescription';

interface ProductDetailsProps {
  product: Product;
  onScrollToSpecs?: () => void;
}

export function ProductDetails({ product, onScrollToSpecs }: ProductDetailsProps) {
  const { title, name, price, sku, description, specifications, brand_id, brand, part_number } = product as any;
  const brandName = typeof brand_id === 'object' && brand_id?.name ? brand_id.name : (brand || 'Asus');

  const { isInWishlist, toggleWishlist } = useWishlistStore();
  const isWishlisted = isInWishlist(product._id);
  const [quantity, setQuantity] = useState(1);
  const [showMorePromos, setShowMorePromos] = useState(false);

  // Key highlights extracted for the summary box
  const highlights = [
    { label: 'CPU', value: specifications?.cpu || 'Intel Core / AMD Ryzen' },
    { label: 'NPU', value: specifications?.npu || (specifications?.cpu?.includes('Ultra') ? 'Intel® AI Boost' : null) },
    { label: 'RAM', value: specifications?.ram || '8GB / 16GB' },
    { label: 'Ổ cứng', value: specifications?.storage || specifications?.storage_capacity || '512GB SSD M.2 NVMe' },
    { label: 'Màn hình', value: specifications?.display || '14" Full HD (1920 x 1080) IPS' },
    { label: 'OS', value: specifications?.os || 'Windows 11 Home' },
  ].filter(h => h.value);

  const handleAddToCart = () => {
    useCartStore.getState().addToCart(product, quantity);
  };

  return (
    <div className="flex flex-col space-y-6">
      {/* 1. BREADCRUMBS */}
      <div className="flex items-center text-xs text-gray-500 gap-1.5 flex-wrap">
        <Link href="/" className="hover:text-blue-600 transition-colors">Trang chủ</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-blue-600 transition-colors">Laptop</Link>
        <span>/</span>
        <span className="text-gray-700 font-medium">{brandName}</span>
      </div>

      {/* 2. TITLE & META */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 leading-snug">
          {title || name}
        </h1>
        <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
          <span className="font-semibold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
            {brandName}
          </span>
          <span>SKU: <strong className="text-gray-700">{part_number || sku || 'NK394W'}</strong></span>
          <span>•</span>
          <span className="text-amber-500 font-medium flex items-center gap-1">
            ★★★★★ <span className="text-gray-500">(0 đánh giá)</span>
          </span>
        </div>
      </div>

      {/* 3. PRICE & ACTIONS */}
      <div className="bg-gradient-to-r from-blue-50/50 to-indigo-50/30 p-4 rounded-xl border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs text-gray-500 block uppercase font-medium">Giá niêm yết chính hãng:</span>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-blue-600">
              {price.toLocaleString('vi-VN')} ₫
            </span>
            <span className="text-sm text-gray-400 line-through">
              {(price * 1.15).toLocaleString('vi-VN')} ₫
            </span>
            <span className="text-xs font-semibold text-red-600 bg-red-100 px-2 py-0.5 rounded">
              -15%
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Quantity Selector */}
          <div className="flex items-center border border-gray-300 rounded-lg bg-white overflow-hidden shadow-sm">
            <button
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition-colors font-bold"
              aria-label="Decrease quantity"
            >
              -
            </button>
            <span className="px-3 py-2 text-sm font-semibold min-w-[2.5rem] text-center">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(q => q + 1)}
              className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition-colors font-bold"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          {/* Add to Cart Button */}
          <Button
            onClick={handleAddToCart}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 shadow-md hover:shadow-lg transition-all"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Thêm vào giỏ
          </Button>

          {/* Wishlist Button */}
          <Button
            variant="outline"
            onClick={() => toggleWishlist(product._id)}
            className={`p-2.5 ${isWishlisted ? 'border-red-500 bg-red-50 text-red-500' : 'text-gray-500'}`}
            aria-label="Yêu thích"
          >
            <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
          </Button>
        </div>
      </div>

      {/* 4. ĐẶC ĐIỂM NỔI BẬT (HIGHLIGHT BOX - FROM USER IMAGE 2) */}
      <div className="border border-blue-200 bg-white rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            Đặc điểm nổi bật
          </h2>
          <button
            onClick={onScrollToSpecs}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
          >
            Xem thông tin chi tiết
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <ul className="space-y-2 text-sm text-gray-700">
          {highlights.map((h, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="font-semibold text-gray-900 min-w-[5rem]">{h.label}:</span>
              <span className="text-gray-800">{h.value}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 5. KHUYẾN MÃI LIÊN QUAN (PROMOTIONS BOX - FROM USER IMAGE 2) */}
      <div className="border border-amber-200 bg-amber-50/40 rounded-xl p-5 shadow-sm">
        <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
          <Gift className="w-5 h-5 text-amber-600" />
          Khuyến mãi liên quan
        </h2>
        <ul className="space-y-2.5 text-sm text-gray-800">
          <li className="flex items-start gap-2">
            <span className="text-amber-600 font-bold">•</span>
            <span>
              Nhập mã <strong>PVLNVBQ260701</strong> tặng 1 Túi đeo lưng/ Balo laptop Targus 15.6 Black trị giá <strong>900.000₫</strong> cho đơn hàng có sản phẩm này.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-600 font-bold">•</span>
            <span>
              <strong>Đổi Điểm Thi THPT:</strong> Voucher Laptop giảm đến <strong>5 triệu</strong> cho Tân sinh viên.{' '}
              <span className="text-blue-600 font-semibold cursor-pointer hover:underline">Xem chi tiết</span>
            </span>
          </li>
          {showMorePromos && (
            <li className="flex items-start gap-2 pt-1 border-t border-amber-200/60">
              <span className="text-amber-600 font-bold">•</span>
              <span>
                <strong>Phụ kiện xịn:</strong> Giảm đến <strong>30%</strong> khi mua kèm chuột, bàn phím, màn hình máy tính.{' '}
                <span className="text-blue-600 font-semibold cursor-pointer hover:underline">Xem chi tiết</span>
              </span>
            </li>
          )}
        </ul>
        <button
          onClick={() => setShowMorePromos(!showMorePromos)}
          className="mt-3 text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          {showMorePromos ? 'Thu gọn khuyến mãi' : 'Xem thêm KM khác'}
          {showMorePromos ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* 6. CHÍNH SÁCH BÁN HÀNG & DỊCH VỤ (FROM USER IMAGE 2) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Chính sách bán hàng */}
        <div className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm space-y-3">
          <h2 className="text-sm font-bold text-gray-900 border-b pb-2">Chính sách bán hàng</h2>
          <div className="flex items-start gap-3 text-xs text-gray-700">
            <Truck className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Miễn phí giao hàng cho đơn từ 5 triệu</p>
              <span className="text-blue-600 cursor-pointer hover:underline">Xem chi tiết</span>
            </div>
          </div>
          <div className="flex items-start gap-3 text-xs text-gray-700">
            <RotateCcw className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Đổi trả trong vòng 10 ngày</p>
              <span className="text-blue-600 cursor-pointer hover:underline">Xem chi tiết</span>
            </div>
          </div>
          <div className="flex items-start gap-3 text-xs text-gray-700">
            <ShieldCheck className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="font-medium">Cam kết hàng chính hãng 100%</p>
          </div>
        </div>

        {/* Dịch vụ khác & Ưu đãi thanh toán */}
        <div className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm space-y-3">
          <h2 className="text-sm font-bold text-gray-900 border-b pb-2">Dịch vụ & Thanh toán</h2>
          <div className="flex items-start gap-3 text-xs text-gray-700">
            <Wrench className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Gói dịch vụ bảo hành / Sửa chữa tận nơi</p>
              <span className="text-blue-600 cursor-pointer hover:underline">Xem chi tiết</span>
            </div>
          </div>
          <div className="pt-2 border-t text-xs text-gray-700">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-bold text-red-600">TPBank</span>
              <span className="font-bold text-orange-500">ShopeePay</span>
              <span className="font-bold text-blue-600">VNPay</span>
              <span className="font-bold text-blue-800">VIB</span>
            </div>
            <p className="text-gray-600">
              Giảm đến <strong>800.000₫</strong> khi thanh toán qua thẻ liên kết.{' '}
              <span className="text-blue-600 cursor-pointer hover:underline">Xem chi tiết</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
