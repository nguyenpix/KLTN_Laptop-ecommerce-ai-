import React from 'react';
import { Product } from '@/shared/types';
import { Button } from '@/shared/components/ui/button';

interface ProductTopBarProps {
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  totalPrice: number;
  quantity: number;
  setQuantity: (quantity: number) => void;
  product: Product;
}

const ProductTopBar: React.FC<ProductTopBarProps> = ({
  product,
  totalPrice,
  quantity,
  setQuantity,
}) => {
  return (
    <div className="bg-muted/40 p-4 flex justify-between items-center border-b">
      <h1 className="text-xl font-bold">{product.name}</h1>
      <div className="flex items-center space-x-4">
        <span className="text-lg font-semibold">{totalPrice.toLocaleString('vi-VN')}đ</span>
        <div className="flex items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
          >
            -
          </Button>
          <span className="px-4 py-1 border-t border-b">{quantity}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setQuantity(quantity + 1)}
          >
            +
          </Button>
        </div>
        <Button>Cập nhật</Button>
      </div>
    </div>
  );
};

export { ProductTopBar };