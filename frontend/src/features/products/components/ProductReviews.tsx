'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Star, Trash2, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { API_URL } from '@/constants/api-url';
import { useAuthStore, getUserId } from '@/store/authStore';
import { Button } from '@/shared/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { recommendationsAPI } from '@/features/recommendations/api';

interface FeedbackUser {
  _id: string;
  name?: string;
  username?: string;
  email?: string;
}

export interface ProductFeedback {
  _id: string;
  user_id: FeedbackUser | null;
  product_id: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ProductFeedbackResponse {
  success: boolean;
  data: {
    feedbacks: ProductFeedback[];
    stats: {
      averageRating: number | string;
      totalFeedbacks: number;
    };
  };
}

export const fetchProductReviews = async (productId: string): Promise<ProductFeedbackResponse> => {
  const res = await fetch(`${API_URL}/feedbacks/product/${productId}?limit=50`);
  if (!res.ok) throw new Error('Không thể tải đánh giá sản phẩm');
  return res.json();
};

export function ProductReviews({ productId }: { productId: string }) {
  const { isLoggedIn, token, user } = useAuthStore();
  const currentUserId = getUserId(user);
  const queryClient = useQueryClient();

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');

  const { data, isLoading } = useQuery<ProductFeedbackResponse>({
    queryKey: ['productReviews', productId],
    queryFn: () => fetchProductReviews(productId),
    enabled: !!productId,
  });

  const feedbacks = data?.data?.feedbacks || [];
  const averageRating = Number(data?.data?.stats?.averageRating || 0);
  const totalFeedbacks = data?.data?.stats?.totalFeedbacks || 0;

  const myExistingReview = feedbacks.find((fb) => fb.user_id?._id === currentUserId);

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!token) throw new Error('Vui lòng đăng nhập để gửi đánh giá');
      if (!comment.trim()) throw new Error('Vui lòng nhập nội dung nhận xét');

      // Nếu user đã có đánh giá trước đó -> cập nhật bằng PUT; ngược lại POST tạo mới
      const url = myExistingReview
        ? `${API_URL}/feedbacks/${myExistingReview._id}`
        : `${API_URL}/feedbacks`;
      const method = myExistingReview ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(
          myExistingReview
            ? { rating, comment: comment.trim() }
            : { product_id: productId, rating, comment: comment.trim() }
        ),
      });

      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.message || 'Không thể gửi đánh giá');
      }
      return body;
    },
    onSuccess: () => {
      toast.success(myExistingReview ? 'Đã cập nhật đánh giá của bạn!' : 'Cảm ơn bạn đã đánh giá sản phẩm!');
      setComment('');
      queryClient.invalidateQueries({ queryKey: ['productReviews', productId] });
      recommendationsAPI
        .trackFeedback({ product_id: productId, rating, comment: comment.trim() })
        .catch(() => {});
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : 'Lỗi gửi đánh giá');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (feedbackId: string) => {
      const res = await fetch(`${API_URL}/feedbacks/${feedbackId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.message || 'Không thể xóa đánh giá');
      return body;
    },
    onSuccess: () => {
      toast.success('Đã xóa đánh giá');
      queryClient.invalidateQueries({ queryKey: ['productReviews', productId] });
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : 'Lỗi xóa đánh giá');
    },
  });

  const renderStars = (score: number, size = 'w-4 h-4') => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${size} ${
            star <= Math.round(score)
              ? 'fill-amber-400 text-amber-400'
              : 'fill-gray-200 text-gray-200'
          }`}
        />
      ))}
    </div>
  );

  return (
    <div className="bg-white rounded-2xl p-6 lg:p-8 border border-gray-200/80 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            Đánh giá & Nhận xét từ khách hàng
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {totalFeedbacks > 0
              ? `${totalFeedbacks} lượt đánh giá thực tế`
              : 'Chưa có đánh giá nào cho sản phẩm này'}
          </p>
        </div>
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5">
          <span className="text-3xl font-extrabold text-amber-600">
            {totalFeedbacks > 0 ? averageRating.toFixed(1) : '0.0'}
          </span>
          <div>
            {renderStars(averageRating)}
            <span className="text-xs text-gray-600">({totalFeedbacks} đánh giá)</span>
          </div>
        </div>
      </div>

      {/* Form gửi / cập nhật đánh giá */}
      <div className="bg-gray-50 rounded-xl p-5 border border-gray-200/80">
        {isLoggedIn ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submitMutation.mutate();
            }}
            className="space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-semibold text-gray-800">
                {myExistingReview ? 'Cập nhật đánh giá của bạn:' : 'Viết đánh giá của bạn:'}
              </span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="p-0.5 transition-transform hover:scale-110"
                    aria-label={`Chọn ${star} sao`}
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= (hoverRating || rating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'fill-gray-200 text-gray-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-sm font-medium text-amber-600">{rating}/5 sao</span>
              </div>
            </div>

            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Chia sẻ trải nghiệm thực tế của bạn về hiệu năng, màn hình, pin của chiếc laptop này..."
              rows={3}
              className="bg-white"
            />

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={submitMutation.isPending || !comment.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {submitMutation.isPending
                  ? 'Đang gửi...'
                  : myExistingReview
                    ? 'Cập nhật đánh giá'
                    : 'Gửi đánh giá'}
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-sm text-gray-600">
              Đăng nhập để viết đánh giá và chia sẻ cảm nhận của bạn về sản phẩm này.
            </p>
            <Button asChild variant="outline">
              <Link href="/login">Đăng nhập ngay</Link>
            </Button>
          </div>
        )}
      </div>

      {/* Danh sách đánh giá */}
      {isLoading ? (
        <p className="text-center text-gray-500 py-6">Đang tải đánh giá...</p>
      ) : feedbacks.length === 0 ? (
        <p className="text-center text-gray-500 py-6">
          Hãy là người đầu tiên đánh giá sản phẩm này!
        </p>
      ) : (
        <div className="divide-y divide-gray-100">
          {feedbacks.map((fb) => {
            const authorName = fb.user_id?.name || fb.user_id?.username || fb.user_id?.email || 'Khách hàng';
            const isMine = currentUserId && fb.user_id?._id === currentUserId;
            return (
              <div key={fb._id} className="py-4 flex items-start justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-sm flex items-center justify-center">
                      {authorName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-900">{authorName}</p>
                      <div className="flex items-center gap-2">
                        {renderStars(fb.rating, 'w-3.5 h-3.5')}
                        <span className="text-xs text-gray-400">
                          {new Date(fb.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 pl-11 whitespace-pre-wrap">{fb.comment}</p>
                </div>

                {isMine && (
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={deleteMutation.isPending}
                    onClick={() => deleteMutation.mutate(fb._id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    aria-label="Xóa đánh giá"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
