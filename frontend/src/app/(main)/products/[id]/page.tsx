'use client';
import React, { useState, use } from 'react';
import { useQuery } from '@tanstack/react-query';

// Types & API
import { Product } from '@/features/products/types';
import { ProductTopBar } from '@/features/products/components/ProductTopBar';
import { ProductDetails } from '@/features/products/components/ProductDetails';
import { ProductGallery } from '@/features/products/components/ProductGallery';
import { RecommendationsList } from '@/features/recommendations';
import { useTrackInteraction } from '@/features/recommendations/hooks';

// API fetcher function
const fetchProductById = async (id: string): Promise<Product> => {
  // The user's API seems to use the numeric ID in the path, not the MongoDB _id
  const res = await fetch(`http://localhost:5000/api/v1/products/${id}`);
  if (!res.ok) {
    throw new Error('Network response was not ok');
  }
  const data = await res.json();
  // Assuming the backend returns the single product object under the 'data' key
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
    enabled: !!id, // Ensures the query runs only when the id is available
  });

  const [quantity, setQuantity] = useState(1);
  const [activeIndex, setActiveIndex] = useState(0);

  // Track product view when product loads
  React.useEffect(() => {
    if (product?._id) {
      trackView(product._id, 5000); // Track 5 seconds view
    }
  }, [product, trackView]);

  if (isLoading) {
    return <div className="container mx-auto my-20 text-center">Loading product...</div>;
  }

  if (isError) {
    return <div className="container mx-auto my-20 text-center text-red-500">Failed to fetch product. Please ensure the backend server is running and the product ID is correct.</div>;
  }

  if (!product) {
    return <div className="container mx-auto my-20 text-center">Product not found.</div>;
  }

  const totalPrice = product.price * quantity;
  const allImages = [product.images.mainImg, ...product.images.sliderImg];

  return (
    <>
      <ProductTopBar
        product={product}
        activeIndex={activeIndex}
        setActiveIndex={setActiveIndex}
        totalPrice={totalPrice}
        quantity={quantity}
        setQuantity={setQuantity}
      />

      <main className="container mx-auto py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <ProductDetails product={product} activeIndex={activeIndex} />
          <ProductGallery images={allImages} productTitle={product.title} />
        </div>

        {/* Recommendations Section */}
        <div className="mt-16 border-t pt-12">
          <RecommendationsList 
            limit={8}
            title="Sản phẩm liên quan có thể bạn thích"
            showMetadata={false}
          />
        </div>
      </main>
    </>
  );
}