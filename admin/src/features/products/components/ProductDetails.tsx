import React from 'react';
import { Product } from '@/shared/types';

interface ProductDetailsProps {
  product: Product;
  activeIndex: number; 
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ product }) => {
  return (
    <div className="product-details-section">
      <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
      <p className="text-sm text-muted-foreground mb-4">{product.title}</p>
      <p className="text-gray-700 mb-2">SKU: {product.sku}</p>
      <p className="text-gray-700 mb-2">Thương hiệu: {product.brand}</p>
      <p className="text-3xl font-bold text-primary mb-4">{product.price.toLocaleString('vi-VN')}đ</p>
      <p className="text-gray-700 mb-2">Tồn kho: {product.stock}</p>
      <p className="text-gray-700 mb-4 whitespace-pre-wrap">Mô tả: {product.description}</p>

      {product.specifications && (
        <div className="specifications-section mt-6">
          <h3 className="text-lg font-semibold mb-3">Thông số kỹ thuật:</h3>
          <ul className="list-disc list-inside">
            {Object.entries(product.specifications).map(([key, value]) => (
              <li key={key}>
                <span className="font-medium">{key.replace(/_/g, ' ')}:</span> {value}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;