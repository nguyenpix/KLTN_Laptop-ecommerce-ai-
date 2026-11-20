'use client';

interface ProductSortProps {
  onSortChange: (filterName: string, value: string | number) => void;
  sortValue?: string;
  limitValue?: number;
}

const sortOptions = [
  { value: "", label: "Position" },
  { value: "price", label: "Price: Low to High" },
  { value: "-price", label: "Price: High to Low" },
  { value: "-createdAt", label: "Newest Arrivals" },
];

const limitOptions = [12, 20, 35, 48];

export default function ProductSort({
  onSortChange,
  sortValue = "",
  limitValue = 20,
}: ProductSortProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Sort By box (Figma Component 43) */}
      <div className="inline-flex items-center border-2 border-[#CACDD8] rounded-[2px] px-3 h-[50px] text-[13px] bg-white">
        <span className="font-semibold text-[#A2A6B0] mr-1.5">Sort By:</span>
        <select
          value={sortValue}
          onChange={(e) => onSortChange("sort", e.target.value)}
          className="font-semibold text-black bg-transparent focus:outline-none cursor-pointer pr-2"
        >
          {sortOptions.map((option) => (
            <option key={option.value || "pos"} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Show per page box (Figma Component 43) */}
      <div className="inline-flex items-center border-2 border-[#CACDD8] rounded-[2px] px-3 h-[50px] text-[13px] bg-white">
        <span className="font-semibold text-[#A2A6B0] mr-1.5">Show:</span>
        <select
          value={limitValue}
          onChange={(e) => onSortChange("limit", Number(e.target.value))}
          className="font-semibold text-black bg-transparent focus:outline-none cursor-pointer pr-2"
        >
          {limitOptions.map((num) => (
            <option key={num} value={num}>
              {num} per page
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
