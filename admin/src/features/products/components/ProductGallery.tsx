import React from 'react';
import Image from 'next/image';

interface ProductGalleryProps {
  images: { url: string }[];
  productTitle: string;
}

const ProductGallery: React.FC<ProductGalleryProps> = ({ images, productTitle }) => {
  return (
    <div className="product-gallery">
      <h3 className="text-lg font-semibold mb-3">Hình ảnh sản phẩm:</h3>
      <div className="grid grid-cols-2 gap-4">
        {images.map((img, index) => (
          <div key={index} className="relative w-full h-48">
            <Image
              src={img.url}
              alt={`${productTitle} - ${index + 1}`}
              fill
              className="object-cover rounded"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export { ProductGallery };