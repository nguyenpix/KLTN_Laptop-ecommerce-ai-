'use client';

import React from 'react';
import { RecommendationsList } from '@/features/recommendations';
import { useTrackInteraction } from '@/features/recommendations/hooks';
import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * 🎯 RECOMMENDATIONS PAGE IN PROFILE
 * Trang gợi ý sản phẩm dành riêng cho user
 * 
 * Features:
 * - Personalized recommendations based on user interactions
 * - Auto-track user behavior
 * - Progressive quality improvements
 * - User-friendly UI with back navigation
 */
export default function ProfileRecommendationsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/profile">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại hồ sơ
            </Button>
          </Link>
          
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-lg">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Gợi ý dành riêng cho bạn
              </h1>
              <p className="text-gray-600 mt-1">
                Các sản phẩm được chọn lọc dựa trên sở thích và lịch sử mua sắm của bạn
              </p>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="bg-blue-50 p-3 rounded-full">
              <svg 
                className="w-6 h-6 text-blue-600" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">
                Làm thế nào để nhận gợi ý chính xác hơn?
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Xem và tìm hiểu các sản phẩm bạn quan tâm</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Thêm sản phẩm vào giỏ hàng và wishlist</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Đánh giá và nhận xét về sản phẩm đã mua</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Mua sắm thường xuyên để hệ thống hiểu bạn hơn</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Recommendations List */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <RecommendationsList 
            limit={20}
            title="Các sản phẩm dành cho bạn"
            showMetadata={true}
          />
        </div>

        {/* Additional Tips */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-100">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <span className="text-2xl">💡</span>
            Mẹo nhỏ
          </h3>
          <p className="text-gray-700 leading-relaxed">
            Hệ thống gợi ý sẽ trở nên thông minh hơn theo thời gian. 
            Càng nhiều tương tác, gợi ý càng chính xác! 
            <br />
            <span className="text-sm text-gray-600 mt-2 inline-block">
              📊 10+ tương tác → Chất lượng thấp | 
              30+ tương tác → Chất lượng trung bình | 
              50+ tương tác → Chất lượng cao
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
