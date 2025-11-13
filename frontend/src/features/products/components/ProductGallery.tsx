'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/shared/components/ui/button';
import { Heart, Share2 } from 'lucide-react';
import { ProductImage } from '@/features/products/types';

interface ProductGalleryProps {
  images: ProductImage[];
  productTitle: string;
}

export function ProductGallery({ images, productTitle }: ProductGalleryProps) {
  const [activeImg, setActiveImg] = useState('');
  const [activeThumbIndex, setActiveThumbIndex] = useState(0);

  useEffect(() => {
    if (images && images.length > 0) {
      setActiveImg(images[0].url);
      setActiveThumbIndex(0);
    }
  }, [images]);

  const handleImageSelect = (url: string, index: number) => {
    setActiveImg(url);
    setActiveThumbIndex(index);
  };

  if (!images || images.length === 0) {
    return <div>No images available.</div>;
  }

  return (
    <div className="flex flex-col items-center gap-4 lg:sticky top-32 self-start">
      <div className="relative w-full h-[500px] bg-gray-100 rounded-lg flex items-center justify-center p-8">
        {activeImg && (
          <Image
            src={activeImg}
            layout="fill"
            objectFit="contain"
            alt={productTitle}
            key={activeImg}
          />
        )}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <Button variant="ghost" size="icon"><Heart className="h-6 w-6 text-gray-500" /></Button>
          <Button variant="ghost" size="icon"><Share2 className="h-6 w-6 text-gray-500" /></Button>
        </div>
      </div>
      <div className="flex gap-3 justify-center mt-2 flex-wrap">
        {images.map((img, index) => (
          <button
            key={img.url || index}
            onClick={() => handleImageSelect(img.url, index)}
            className={`h-16 w-16 rounded-md border-2 p-1 ${activeThumbIndex === index ? 'border-blue-600' : 'border-transparent'}`}
            aria-label={`View image ${index + 1}`}
          >
            <div className="relative h-full w-full">
              <Image src={img.url} layout="fill" objectFit="cover" alt={img.alt_text} className="rounded-sm" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
