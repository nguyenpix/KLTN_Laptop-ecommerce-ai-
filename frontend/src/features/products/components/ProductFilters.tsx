'use client';

import { useBrands } from "@/features/products/hook/useBrands";
import { useColors } from "@/features/products/hook/useColors";
import { useCategories } from "@/features/products/hook/useCategories";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface ProductFiltersProps {
  onFilterChange: (filterName: string, value: string | number) => void;
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
}

const priceRanges = [
  { value: 'all', label: 'Tất cả' },
  { value: '0-10000000', label: 'Dưới 10 triệu' },
  { value: '10000000-15000000', label: '10 - 15 triệu' },
  { value: '15000000-20000000', label: '15 - 20 triệu' },
  { value: '20000000-25000000', label: '20 - 25 triệu' },
  { value: '25000000-999999999', label: 'Trên 25 triệu' },
];

export default function ProductFilters({ onFilterChange }: ProductFiltersProps) {
  const { data: categoriesData } = useCategories();
  const { data: brandsData } = useBrands();
  const { data: colorsData } = useColors();

  const categories = categoriesData?.data || [];
  const brands = brandsData?.data || [];
  const colors = colorsData?.data || [];

  const handlePriceRangeChange = (value: string) => {
    if (value === 'all') {
      onFilterChange("minPrice", "");
      onFilterChange("maxPrice", "");
      return;
    }
    const [min, max] = value.split('-').map(Number);
    onFilterChange("minPrice", min);
    onFilterChange("maxPrice", max);
  };

  return (
    <div className="space-y-8">
      {/* Category Filter */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Danh mục sản phẩm</h3>
        <RadioGroup onValueChange={(value) => onFilterChange("category", value)} defaultValue="">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="" id="cat-all" />
            <Label htmlFor="cat-all" className="font-normal cursor-pointer">Tất cả</Label>
          </div>
          {categories.map((category: Category) => (
            <div key={category._id} className="flex items-center space-x-2">
              <RadioGroupItem value={category._id} id={category._id} />
              <Label htmlFor={category._id} className="font-normal cursor-pointer">
                {category.name}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Brand Filter */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Thương hiệu</h3>
        <RadioGroup onValueChange={(value) => onFilterChange("brand", value)} defaultValue="">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="" id="brand-all" />
            <Label htmlFor="brand-all" className="font-normal cursor-pointer">Tất cả</Label>
          </div>
          {brands.map((brand: Brand) => (
            <div key={brand._id} className="flex items-center space-x-2">
              <RadioGroupItem value={brand._id} id={brand._id} />
              <Label htmlFor={brand._id} className="font-normal cursor-pointer">{brand.name}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Color Filter */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Màu sắc</h3>
        <RadioGroup onValueChange={(value) => onFilterChange("color", value)} defaultValue="">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="" id="color-all" />
            <Label htmlFor="color-all" className="font-normal cursor-pointer">Tất cả</Label>
          </div>
          {colors.map((color: Color) => (
            <div key={color._id} className="flex items-center space-x-2">
              <RadioGroupItem value={color._id} id={color._id} />
              <Label htmlFor={color._id} className="font-normal cursor-pointer">{color.name}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Price Filter */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Mức giá</h3>
        <RadioGroup onValueChange={handlePriceRangeChange} defaultValue="all">
          {priceRanges.map((range) => (
            <div key={range.value} className="flex items-center space-x-2">
              <RadioGroupItem value={range.value} id={range.value} />
              <Label htmlFor={range.value} className="font-normal cursor-pointer">{range.label}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    </div>
  );
}