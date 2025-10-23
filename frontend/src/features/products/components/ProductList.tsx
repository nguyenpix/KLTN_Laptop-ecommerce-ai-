"use client";
import { useState } from "react";
import { useProducts } from "../hook/useProducts";
import { Product } from "@/features/products/types";
import ProductCard from "./ProductCard";
import { LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";

const ProductList = () => {
    const [layout, setLayout] = useState<"grid" | "list">("grid");

    const {
        data: products,
        isLoading,
        error,
    } = useProducts();

    if (isLoading) {
        return <div>Đang tải sản phẩm...</div>;
    }

    if (error) {
        return <div>Có lỗi xảy ra: {error.message}</div>;
    }

    const containerClasses =
        layout === "grid"
            ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            : "flex flex-col gap-6";

    return (
        <section>
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <Button
                        variant={layout === "grid" ? "default" : "outline"}
                        size="icon"
                        onClick={() => setLayout("grid")}
                    >
                        <LayoutGrid className="w-5 h-5" />
                    </Button>
                    <Button
                        variant={layout === "list" ? "default" : "outline"}
                        size="icon"
                        onClick={() => setLayout("list")}
                    >
                        <List className="w-5 h-5" />
                    </Button>
                </div>
            </div>
            <div className={containerClasses}>
                {products?.map((product: Product) => (
                    <ProductCard key={product.id} product={product} layout={layout} />
                ))}
            </div>
        </section>
    );
};

export default ProductList;
