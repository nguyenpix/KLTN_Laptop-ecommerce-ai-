'use client';
import React from 'react';
import Link from 'next/link';
import { Product } from '@/features/products/types';

interface ProductDetailsProps {
  product: Product;
  activeIndex: number;
}

export function ProductDetails({ product, activeIndex }: ProductDetailsProps) {
  const { title, price, sku, description, specifications, faqs } = product;

  const renderContent = () => {
    switch (activeIndex) {
      case 0: // About
        return (
          <div
            className="mt-4 text-gray-700 leading-relaxed prose max-w-none"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        );
      case 1: // Details
        return (
          <ul className="mt-4 space-y-3 text-gray-700">
            {Object.entries(specifications).map(([key, value]) => (
              <li key={key} className="flex justify-between border-b pb-2 text-sm">
                <span className="font-semibold capitalize text-gray-600">{key.replace(/_/g, ' ')}</span>
                <span className="text-right max-w-[60%]">{value}</span>
              </li>
            ))}
          </ul>
        );
      case 2: // Specs (using FAQs for content)
        return (
          <div className="mt-4 space-y-4">
            {faqs.map(faq => (
              <div key={faq._id}>
                <p className="font-semibold">{faq.question}</p>
                <p className="text-gray-600 mt-1">{faq.answer}</p>
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col">
      <div className="text-sm text-gray-500 mb-2">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/products" className="hover:text-blue-600">Laptops</Link>
      </div>
      <h1 className="text-3xl lg:text-4xl font-bold">{title}</h1>
      <Link href="#reviews" className="text-sm text-blue-600 hover:underline mt-2">
        Be the first to review this product
      </Link>

      <div className="my-6">
        <span className="text-gray-500">Price per item: </span>
        <span className="text-xl font-bold">
          {price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
        </span>
      </div>

      {/* Render content based on activeIndex */}
      <div className="mt-6 pt-6 border-t">
        {renderContent()}
      </div>

      <div className="mt-6 pt-6 border-t text-sm text-gray-500">
        <span>SKU: {sku}</span>
      </div>
    </div>
  );
}
