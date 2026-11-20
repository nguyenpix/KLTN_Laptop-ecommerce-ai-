'use client';

import React, { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useBrands } from "@/features/products/hook/useBrands";
import { useColors } from "@/features/products/hook/useColors";
import { useCategories } from "@/features/products/hook/useCategories";
import { useWishlistStore } from "@/store/wishlistStore";

interface ProductFiltersProps {
  onFilterChange: (filterName: string, value: string | number) => void;
  onClearAll?: () => void;
  activeFilters?: Record<string, string | number>;
}

interface Category {
  _id: string;
  name: string;
}

interface Brand {
  _id: string;
  name: string;
}

interface Color {
  _id: string;
  name: string;
  hex?: string;
}

const priceRanges = [
  { value: "0-10000000", label: "0 ₫ - 10.000.000 ₫" },
  { value: "10000000-15000000", label: "10.000.000 ₫ - 15.000.000 ₫" },
  { value: "15000000-20000000", label: "15.000.000 ₫ - 20.000.000 ₫" },
  { value: "20000000-25000000", label: "20.000.000 ₫ - 25.000.000 ₫" },
  { value: "25000000-35000000", label: "25.000.000 ₫ - 35.000.000 ₫" },
  { value: "35000000-999999999", label: "35.000.000 ₫ And Above" },
];

const cpuOptions = [
  { value: "i3", label: "Intel Core i3" },
  { value: "i5", label: "Intel Core i5" },
  { value: "i7", label: "Intel Core i7" },
  { value: "Ultra", label: "Intel Core Ultra" },
  { value: "Ryzen 5", label: "AMD Ryzen 5" },
  { value: "Ryzen 7", label: "AMD Ryzen 7" },
  { value: "Apple M", label: "Apple M Series" },
];

const ramOptions = [
  { value: "8GB", label: "8GB" },
  { value: "16GB", label: "16GB" },
  { value: "32GB", label: "32GB" },
];

const gpuOptions = [
  { value: "RTX", label: "NVIDIA GeForce RTX" },
  { value: "GTX", label: "NVIDIA GeForce GTX" },
  { value: "Iris", label: "Intel Iris Xe" },
  { value: "Radeon", label: "AMD Radeon" },
];

const storageOptions = [
  { value: "256GB", label: "256GB SSD" },
  { value: "512GB", label: "512GB SSD" },
  { value: "1TB", label: "1TB SSD" },
];

export default function ProductFilters({
  onFilterChange,
  onClearAll,
  activeFilters = {},
}: ProductFiltersProps) {
  const { data: categoriesData } = useCategories();
  const { data: brandsData } = useBrands();
  const { data: colorsData } = useColors();
  const { items: wishlistItems } = useWishlistStore();

  const categories: Category[] = categoriesData?.data || [];
  const brands: Brand[] = brandsData?.data || [];
  const colors: Color[] = colorsData?.data || [];

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    category: true,
    price: true,
    color: true,
    cpu: true,
    ram: false,
    gpu: false,
    storage: false,
  });

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePriceRangeSelect = (value: string) => {
    const currentRange =
      activeFilters.minPrice !== "" && activeFilters.maxPrice !== ""
        ? `${activeFilters.minPrice}-${activeFilters.maxPrice}`
        : "";
    if (currentRange === value) {
      onFilterChange("minPrice", "");
      onFilterChange("maxPrice", "");
      return;
    }
    const [min, max] = value.split("-").map(Number);
    onFilterChange("minPrice", min);
    onFilterChange("maxPrice", max);
  };

  const activeCount = ["category", "brand", "color", "cpu", "ram", "gpu", "storage", "minPrice"].filter(
    (k) => activeFilters[k] !== undefined && activeFilters[k] !== ""
  ).length;

  const currentPriceRange =
    activeFilters.minPrice !== "" && activeFilters.maxPrice !== ""
      ? `${activeFilters.minPrice}-${activeFilters.maxPrice}`
      : "";

  return (
    <div className="space-y-2 w-full">
      {/* 1. FILTERS BOX — Figma Frame 102 (#F5F7FF) */}
      <div className="bg-[#F5F7FF] p-4 space-y-4">
        <div className="text-center space-y-3 pb-2">
          <h3 className="font-bold text-[16px] text-black">Filters</h3>
          <button
            type="button"
            onClick={onClearAll}
            className="w-full h-[37px] rounded-full border-2 border-[#A2A6B0] text-[#A2A6B0] hover:border-black hover:text-black text-[14px] font-semibold transition-colors"
          >
            Clear Filter
          </button>
        </div>

        {/* Category Section */}
        <div className="pt-2 border-t border-[#CACDD8]/50">
          <button
            type="button"
            onClick={() => toggleSection("category")}
            className="w-full flex items-center justify-between font-semibold text-[14px] text-black py-1.5"
          >
            <span>Category</span>
            {openSections.category ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {openSections.category && (
            <ul className="mt-2 space-y-2 text-[13px]">
              {categories.map((cat) => {
                const isSelected = activeFilters.category === cat._id;
                return (
                  <li key={cat._id}>
                    <button
                      type="button"
                      onClick={() => onFilterChange("category", isSelected ? "" : cat._id)}
                      className={`w-full flex items-center justify-between text-left uppercase transition-colors ${
                        isSelected ? "text-[#0156FF] font-semibold" : "text-black hover:text-[#0156FF]"
                      }`}
                    >
                      <span className="truncate pr-2">{cat.name}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Price Section */}
        <div className="pt-2 border-t border-[#CACDD8]/50">
          <button
            type="button"
            onClick={() => toggleSection("price")}
            className="w-full flex items-center justify-between font-semibold text-[14px] text-black py-1.5"
          >
            <span>Price</span>
            {openSections.price ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {openSections.price && (
            <ul className="mt-2 space-y-2 text-[13px]">
              {priceRanges.map((range) => {
                const isSelected = currentPriceRange === range.value;
                return (
                  <li key={range.value}>
                    <button
                      type="button"
                      onClick={() => handlePriceRangeSelect(range.value)}
                      className={`w-full flex items-center justify-between text-left transition-colors ${
                        isSelected ? "text-[#0156FF] font-semibold" : "text-black hover:text-[#0156FF]"
                      }`}
                    >
                      <span>{range.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Color Swatches Section (Figma Group 138) */}
        <div className="pt-2 border-t border-[#CACDD8]/50">
          <button
            type="button"
            onClick={() => toggleSection("color")}
            className="w-full flex items-center justify-between font-semibold text-[14px] text-black py-1.5"
          >
            <span>Color</span>
            {openSections.color ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {openSections.color && (
            <div className="mt-2 flex flex-wrap gap-2">
              {colors.map((color) => {
                const isSelected = activeFilters.color === color._id;
                return (
                  <button
                    key={color._id}
                    type="button"
                    onClick={() => onFilterChange("color", isSelected ? "" : color._id)}
                    title={color.name}
                    className={`w-[27px] h-[27px] rounded-full p-0.5 flex items-center justify-center transition-all ${
                      isSelected ? "ring-2 ring-[#0156FF]" : "hover:ring-1 hover:ring-gray-400"
                    }`}
                  >
                    <span
                      className="w-[21px] h-[21px] rounded-full border border-gray-300 block"
                      style={{ backgroundColor: color.hex || "#000000" }}
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* CPU Filter Section */}
        <div className="pt-2 border-t border-[#CACDD8]/50">
          <button
            type="button"
            onClick={() => toggleSection("cpu")}
            className="w-full flex items-center justify-between font-semibold text-[14px] text-black py-1.5"
          >
            <span>CPU</span>
            {openSections.cpu ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {openSections.cpu && (
            <ul className="mt-2 space-y-1.5 text-[13px]">
              {cpuOptions.map((opt) => {
                const isSelected = activeFilters.cpu === opt.value;
                return (
                  <li key={opt.value}>
                    <button
                      type="button"
                      onClick={() => onFilterChange("cpu", isSelected ? "" : opt.value)}
                      className={`w-full text-left transition-colors ${
                        isSelected ? "text-[#0156FF] font-semibold" : "text-black hover:text-[#0156FF]"
                      }`}
                    >
                      {opt.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* RAM Filter Section */}
        <div className="pt-2 border-t border-[#CACDD8]/50">
          <button
            type="button"
            onClick={() => toggleSection("ram")}
            className="w-full flex items-center justify-between font-semibold text-[14px] text-black py-1.5"
          >
            <span>RAM</span>
            {openSections.ram ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {openSections.ram && (
            <ul className="mt-2 space-y-1.5 text-[13px]">
              {ramOptions.map((opt) => {
                const isSelected = activeFilters.ram === opt.value;
                return (
                  <li key={opt.value}>
                    <button
                      type="button"
                      onClick={() => onFilterChange("ram", isSelected ? "" : opt.value)}
                      className={`w-full text-left transition-colors ${
                        isSelected ? "text-[#0156FF] font-semibold" : "text-black hover:text-[#0156FF]"
                      }`}
                    >
                      {opt.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* GPU Filter Section */}
        <div className="pt-2 border-t border-[#CACDD8]/50">
          <button
            type="button"
            onClick={() => toggleSection("gpu")}
            className="w-full flex items-center justify-between font-semibold text-[14px] text-black py-1.5"
          >
            <span>Graphics (GPU)</span>
            {openSections.gpu ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {openSections.gpu && (
            <ul className="mt-2 space-y-1.5 text-[13px]">
              {gpuOptions.map((opt) => {
                const isSelected = activeFilters.gpu === opt.value;
                return (
                  <li key={opt.value}>
                    <button
                      type="button"
                      onClick={() => onFilterChange("gpu", isSelected ? "" : opt.value)}
                      className={`w-full text-left transition-colors ${
                        isSelected ? "text-[#0156FF] font-semibold" : "text-black hover:text-[#0156FF]"
                      }`}
                    >
                      {opt.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Storage Filter Section */}
        <div className="pt-2 border-t border-[#CACDD8]/50">
          <button
            type="button"
            onClick={() => toggleSection("storage")}
            className="w-full flex items-center justify-between font-semibold text-[14px] text-black py-1.5"
          >
            <span>Storage</span>
            {openSections.storage ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {openSections.storage && (
            <ul className="mt-2 space-y-1.5 text-[13px]">
              {storageOptions.map((opt) => {
                const isSelected = activeFilters.storage === opt.value;
                return (
                  <li key={opt.value}>
                    <button
                      type="button"
                      onClick={() => onFilterChange("storage", isSelected ? "" : opt.value)}
                      className={`w-full text-left transition-colors ${
                        isSelected ? "text-[#0156FF] font-semibold" : "text-black hover:text-[#0156FF]"
                      }`}
                    >
                      {opt.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <button
          type="button"
          className="w-full h-[37px] rounded-full bg-[#0156FF] hover:bg-blue-700 text-white text-[14px] font-semibold transition-colors"
        >
          Apply Filters {activeCount > 0 ? `(${activeCount})` : ""}
        </button>
      </div>

      {/* 2. BRANDS BOX — Figma Frame 103 (#F5F7FF + 2-col Brand Grid) */}
      <div className="bg-[#F5F7FF]">
        <div className="p-4 text-center space-y-3">
          <h3 className="font-bold text-[16px] text-black">Brands</h3>
          <button
            type="button"
            onClick={() => onFilterChange("brand", "")}
            className="w-full h-[37px] rounded-full border-2 border-[#A2A6B0] text-[#A2A6B0] hover:border-black hover:text-black text-[14px] font-semibold transition-colors"
          >
            All Brands
          </button>
        </div>
        <div className="grid grid-cols-2 gap-[1px] bg-[#F5F7FF] border-t border-[#F5F7FF]">
          {brands.map((brand) => {
            const isSelected = activeFilters.brand === brand._id;
            return (
              <button
                key={brand._id}
                type="button"
                onClick={() => onFilterChange("brand", isSelected ? "" : brand._id)}
                className={`h-[75px] bg-white flex items-center justify-center px-2 text-center font-bold text-sm uppercase tracking-wider transition-all ${
                  isSelected
                    ? "text-[#0156FF] ring-2 ring-inset ring-[#0156FF]"
                    : "text-gray-600 hover:text-black"
                }`}
              >
                {brand.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. COMPARE PRODUCTS BOX — Figma Group 126 */}
      <div className="bg-[#F5F7FF] p-4 text-center space-y-2">
        <h3 className="font-bold text-[16px] text-black">Compare Products</h3>
        <p className="text-[13px] text-black leading-relaxed">
          You have no items to compare.
        </p>
      </div>

      {/* 4. MY WISH LIST BOX — Figma Group 127 */}
      <div className="bg-[#F5F7FF] p-4 text-center space-y-2">
        <h3 className="font-bold text-[16px] text-black">My Wish List</h3>
        {wishlistItems.length === 0 ? (
          <p className="text-[13px] text-black leading-relaxed">
            You have no items in your wish list.
          </p>
        ) : (
          <div className="space-y-2">
            <p className="text-[13px] text-black">
              You have <strong>{wishlistItems.length}</strong> item(s) in your wish list.
            </p>
            <Link
              href="/wishlist"
              className="inline-block text-xs font-semibold text-[#0156FF] hover:underline"
            >
              View Wish List →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
