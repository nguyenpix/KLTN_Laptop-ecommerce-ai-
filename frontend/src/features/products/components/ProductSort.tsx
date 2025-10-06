'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProductSortProps {
  onSortChange: (filterName: string, value: string) => void;
}

const sortOptions = [
  { value: "default", label: "Mặc định" },
  { value: "price", label: "Giá: Thấp đến Cao" },
  { value: "-price", label: "Giá: Cao đến Thấp" },
  { value: "-createdAt", label: "Mới nhất" },
];

export default function ProductSort({ onSortChange }: ProductSortProps) {
  return (
    <Select onValueChange={(value) => onSortChange("sort", value)} defaultValue="default">
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Sắp xếp theo" />
      </SelectTrigger>
      <SelectContent>
        {sortOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}