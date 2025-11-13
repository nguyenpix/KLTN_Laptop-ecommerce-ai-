"use client";
import React from "react";
import { Button } from "@/shared/components/ui/button";
import { ChevronUp, ChevronDown, ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { Product } from "@/features/products/types";

interface ProductTopBarProps {
  product: Product;
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  totalPrice: number;
  quantity: number;
  setQuantity: React.Dispatch<React.SetStateAction<number>>;
}

export function ProductTopBar({
  product,
  activeIndex,
  setActiveIndex,
  totalPrice,
  quantity,
  setQuantity,
}: ProductTopBarProps) {
  return (
    <div className="border-b sticky top-0 bg-white/95 backdrop-blur-sm z-10">
      <div className="container mx-auto flex justify-between items-center py-4">
        {/* Left side: Tab buttons */}
        <div className="flex gap-8 font-semibold">
          <button
            onClick={() => setActiveIndex(0)}
            className={`pb-2 transition-colors ${
              activeIndex === 0
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-black"
            }`}
          >
            About Product
          </button>
          <button
            onClick={() => setActiveIndex(1)}
            className={`pb-2 transition-colors ${
              activeIndex === 1
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-black"
            }`}
          >
            Details
          </button>
          <button
            onClick={() => setActiveIndex(2)}
            className={`pb-2 transition-colors ${
              activeIndex === 2
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-black"
            }`}
          >
            Specs
          </button>
        </div>

        {/* Right side: Bill section */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-sm text-gray-600">Total</span>
            <p className="font-bold text-lg">
              {totalPrice.toLocaleString("vi-VN", {
                style: "currency",
                currency: "VND",
              })}
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-gray-100 p-2">
            <span className="px-4 font-semibold text-lg">{quantity}</span>
            <div className="flex flex-col">
              <ChevronUp
                className="h-5 w-5 cursor-pointer text-gray-600 hover:text-black"
                onClick={() => setQuantity((q) => q + 1)}
              />
              <ChevronDown
                className="h-5 w-5 cursor-pointer text-gray-600 hover:text-black"
                onClick={() => setQuantity((q) => (q > 1 ? q - 1 : 1))}
              />
            </div>
          </div>
          <Button
            className="w-full"
            size="sm"
            onClick={() => useCartStore.getState().addToCart(product, 1)}
          >
            Thêm vào giỏ hàng
          </Button>
          <Button variant="outline">
            <img src="/assets/icon/paypal.svg" alt="Paypal" className="h-6" />
          </Button>
        </div>
      </div>
    </div>
  );
}
