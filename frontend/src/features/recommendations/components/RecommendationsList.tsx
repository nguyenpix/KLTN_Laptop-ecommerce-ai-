"use client";

import React from "react";
import { useRecommendations } from "../hooks";
import ProductCard from "@/features/products/components/ProductCard";

interface RecommendationsListProps {
  limit?: number;
  productId?: string;
  title?: string;
  showMetadata?: boolean;
}

export function RecommendationsList({
  limit = 10,
  productId,
  title = "Sản phẩm dành riêng cho bạn",
  showMetadata = true,
}: RecommendationsListProps) {
  const { recommendations, isLoading, error, metadata, refetch } =
    useRecommendations({ limit, productId });

  if (isLoading) {
    return (
      <div className="w-full py-10 text-center">
        <p className="text-[14px] text-[#A2A6B0]">
          Đang tải gợi ý sản phẩm từ AI...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-[#F5F7FF] p-6 text-center">
        <p className="text-[14px] text-[#C94D3F] mb-3">
          Không thể tải gợi ý sản phẩm
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="h-[36px] px-6 rounded-[50px] bg-[#0156FF] text-white text-[13px] font-semibold"
        >
          Thử lại
        </button>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="w-full bg-[#F5F7FF] p-8 text-center">
        <p className="text-[14px] font-semibold text-black mb-1">
          Chưa có gợi ý sản phẩm
        </p>
        <p className="text-[13px] text-[#A2A6B0]">
          Hãy xem và tương tác với sản phẩm để nhận gợi ý phù hợp nhất!
        </p>
      </div>
    );
  }

  return (
    <section className="w-full">
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-[20px] font-semibold text-black">{title}</h2>
          {showMetadata && metadata && (
            <div className="mt-1 flex flex-wrap items-center gap-3 text-[12px] text-[#666666]">
              <span>
                Độ chính xác AI:{" "}
                <strong className={getQualityColor(metadata.quality || "default")}>
                  {(metadata.quality || "default").toUpperCase()}
                </strong>
              </span>
              <span>•</span>
              <span>{metadata.interaction_count ?? 0} tương tác đã học</span>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          className="h-[36px] px-5 rounded-[50px] border-2 border-[#0156FF] text-[#0156FF] hover:bg-[#0156FF] hover:text-white text-[13px] font-semibold transition-colors"
        >
          Làm mới gợi ý
        </button>
      </div>

      {/* Recommendations Grid using Figma ProductCard */}
      <div
        className={`grid grid-cols-2 sm:grid-cols-3 ${
          limit === 6 ? "lg:grid-cols-6" : "lg:grid-cols-4"
        } gap-2`}
      >
        {recommendations.map((recommendation: any) => {
          const pId =
            recommendation._id?.toString() ||
            recommendation.productId ||
            recommendation.product_id ||
            "";
          const pName =
            recommendation.name || recommendation.title || "Laptop";
          const imgUrl =
            recommendation.images?.mainImg?.url ||
            recommendation.image ||
            "/placeholder.jpg";
          const brandName =
            recommendation.brand_id?.name || recommendation.brand || "";
          const matchPercent =
            recommendation.hybrid_score?.match_percentage ||
            recommendation.similarity?.match_percentage ||
            (recommendation.hybrid_score?.final_score !== undefined
              ? Math.round(recommendation.hybrid_score.final_score * 100)
              : recommendation.similarity?.score !== undefined
              ? Math.round(recommendation.similarity.score * 100)
              : recommendation.final_score !== undefined
              ? Math.round(recommendation.final_score * 100)
              : recommendation.similarity_score !== undefined
              ? Math.round(recommendation.similarity_score * 100)
              : 90);

          const productForCard = {
            _id: pId,
            id: recommendation.id || 0,
            title: pName,
            name: pName,
            description: recommendation.description || "",
            price: recommendation.price || 0,
            stock: recommendation.stock ?? 10,
            sku: recommendation.sku || "",
            images: {
              mainImg: {
                url: imgUrl,
                alt_text: pName,
              },
              sliderImg: recommendation.images?.sliderImg || [],
            },
            specifications: recommendation.specifications || {},
            color: recommendation.color || "",
            brand: brandName,
            faqs: recommendation.faqs || [],
            part_number: recommendation.part_number || "",
            series: recommendation.series || "",
            category_id: recommendation.category_id || [],
          };

          return (
            <ProductCard
              key={pId}
              product={productForCard}
              badge={`${matchPercent}% Match`}
            />
          );
        })}
      </div>
    </section>
  );
}

function getQualityColor(quality: string): string {
  switch (quality) {
    case "high":
      return "text-[#78A962]";
    case "medium":
      return "text-[#0156FF]";
    case "low":
      return "text-amber-600";
    default:
      return "text-[#A2A6B0]";
  }
}
