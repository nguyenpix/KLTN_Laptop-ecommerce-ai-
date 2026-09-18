'use client';
import React, { useState, useRef, use } from 'react';
import { useQuery } from '@tanstack/react-query';

// Types & Components
import { Product } from '@/features/products/types';
import { ProductTopBar } from '@/features/products/components/ProductTopBar';
import { ProductDetails } from '@/features/products/components/ProductDetails';
import { ProductGallery } from '@/features/products/components/ProductGallery';
import { ProductSpecsTable } from '@/features/products/components/ProductSpecsTable';
import { renderFormattedDescription } from '@/features/products/utils/formatProductDescription';
import { RecommendationsList } from '@/features/recommendations';
import { useTrackInteraction } from '@/features/recommendations/hooks';

// API fetcher function
const fetchProductById = async (id: string): Promise<Product> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
  const res = await fetch(`${apiUrl}/products/${id}`);
  if (!res.ok) {
    throw new Error('Network response was not ok');
  }
  const data = await res.json();
  return data.data;
};

interface ProductDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = use(params);
  const { trackView } = useTrackInteraction();

  const { data: product, isLoading, isError } = useQuery<Product>({
    queryKey: ['product', id],
    queryFn: () => fetchProductById(id),
    enabled: !!id,
  });

  const [quantity, setQuantity] = useState(1);
  const [topBarIndex, setTopBarIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'specs' | 'details'>('specs');
  const specsSectionRef = useRef<HTMLDivElement>(null);

  // Track product view when product loads
  React.useEffect(() => {
    if (product?._id) {
      trackView(product._id, 5000);
    }
  }, [product, trackView]);

  const scrollToSpecs = (tab: 'specs' | 'details' = 'specs') => {
    setActiveTab(tab);
    if (specsSectionRef.current) {
      specsSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleTopBarTabChange = (index: number) => {
    setTopBarIndex(index);
    if (index === 0) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (index === 1) {
      scrollToSpecs('specs');
    } else if (index === 2) {
      scrollToSpecs('details');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto my-24 flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-600 font-medium">Đang tải thông tin sản phẩm...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto my-24 text-center">
        <div className="p-8 max-w-lg mx-auto bg-red-50 border border-red-200 rounded-xl text-red-600">
          <p className="font-semibold text-lg mb-2">Không thể tải thông tin sản phẩm</p>
          <p className="text-sm">Vui lòng kiểm tra lại kết nối hoặc thử lại sau.</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto my-24 text-center text-gray-500">
        Không tìm thấy sản phẩm.
      </div>
    );
  }

  const totalPrice = product.price * quantity;
  const allImages = [
    product.images.mainImg,
    ...(product.images.sliderImg || [])
  ].filter(Boolean);

  return (
    <div className="bg-gray-50/40 min-h-screen">
      {/* Sticky Top Bar with quick purchase & tab jump */}
      <ProductTopBar
        product={product}
        activeIndex={topBarIndex}
        setActiveIndex={handleTopBarTabChange}
        totalPrice={totalPrice}
        quantity={quantity}
        setQuantity={setQuantity}
      />

      <main className="container mx-auto px-4 py-8 space-y-12">
        {/* TOP SECTION: Gallery (Left) & Core Details / Actions (Right) */}
        <div className="bg-white rounded-2xl p-6 lg:p-8 border border-gray-200/80 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Gallery (Left: 5 cols) */}
            <div className="lg:col-span-5">
              <ProductGallery images={allImages} productTitle={product.title || product.name} />
            </div>

            {/* Details & Offers (Right: 7 cols) */}
            <div className="lg:col-span-7">
              <ProductDetails 
                product={product} 
                onScrollToSpecs={() => scrollToSpecs('specs')}
              />
            </div>
          </div>
        </div>

        {/* BOTTOM TABS SECTION: Thông số kỹ thuật | Chi tiết sản phẩm (Images 1 & 3) */}
        <div ref={specsSectionRef} className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden scroll-mt-24">
          {/* Tab Header */}
          <div className="flex border-b border-gray-200 bg-gray-50/50">
            <button
              onClick={() => setActiveTab('specs')}
              className={`flex-1 py-4 text-center font-bold text-base transition-all relative ${
                activeTab === 'specs'
                  ? 'text-blue-600 bg-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/60'
              }`}
            >
              Thông số kỹ thuật
              {activeTab === 'specs' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
              )}
            </button>

            <button
              onClick={() => setActiveTab('details')}
              className={`flex-1 py-4 text-center font-bold text-base transition-all relative ${
                activeTab === 'details'
                  ? 'text-blue-600 bg-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/60'
              }`}
            >
              Chi tiết sản phẩm
              {activeTab === 'details' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
              )}
            </button>
          </div>

          {/* Tab Content Container */}
          <div className="p-6 lg:p-8">
            {activeTab === 'specs' ? (
              /* TAB 1: THÔNG SỐ KỸ THUẬT (Image 1) */
              <div className="max-w-4xl mx-auto">
                <ProductSpecsTable product={product} />
              </div>
            ) : (
              /* TAB 2: CHI TIẾT SẢN PHẨM (Image 3) */
              <div className="max-w-4xl mx-auto">
                {renderFormattedDescription(product.description, product.title || product.name)}
              </div>
            )}
          </div>
        </div>

        {/* RECOMMENDATIONS SECTION: Laptop cấu hình tương tự (AI Gợi ý) */}
        <div className="bg-white rounded-2xl p-6 lg:p-8 border border-gray-200/80 shadow-sm">
          <RecommendationsList 
            productId={product._id}
            limit={8}
            title="Laptop tương tự (Recommendations)"
            showMetadata={false}
          />
        </div>
      </main>
    </div>
  );
}