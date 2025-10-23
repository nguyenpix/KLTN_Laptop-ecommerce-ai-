# 🎯 Recommendations Feature - Frontend Integration

## 📋 Tổng quan

Frontend integration cho **Recommendation System Phase 2** với **Lazy Initialization**. Backend tự động tạo user profile khi user request recommendations lần đầu.

## 🏗️ Cấu trúc

```
src/features/recommendations/
├── api.ts                    # API client (singleton)
├── types.ts                  # TypeScript types
├── index.ts                  # Main exports
├── hooks/
│   ├── index.ts
│   ├── useRecommendations.ts    # Fetch recommendations
│   └── useTrackInteraction.ts   # Track user interactions
└── components/
    ├── index.ts
    ├── RecommendationCard.tsx   # Single recommendation card
    └── RecommendationsList.tsx  # Recommendations container
```

## 🚀 Sử dụng

### 1️⃣ Hiển thị Recommendations List

```tsx
import { RecommendationsList } from '@/features/recommendations';

export default function HomePage() {
  return (
    <RecommendationsList 
      limit={10}
      title="Sản phẩm dành riêng cho bạn"
      showMetadata={true}
    />
  );
}
```

### 2️⃣ Sử dụng Hooks

#### Get Recommendations
```tsx
import { useRecommendations } from '@/features/recommendations';

function MyComponent() {
  const { recommendations, isLoading, error, metadata, refetch } = useRecommendations({
    limit: 10,
    enabled: true,
    refetchOnMount: true,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>Quality: {metadata?.quality}</h2>
      <button onClick={refetch}>Refresh</button>
      {recommendations.map(rec => (
        <div key={rec.productId}>{rec.product.name}</div>
      ))}
    </div>
  );
}
```

#### Track Interactions
```tsx
import { useTrackInteraction } from '@/features/recommendations';

function ProductPage({ productId }: { productId: string }) {
  const { trackView, toggleLike, trackAddToCart } = useTrackInteraction();

  // Auto-track view on mount
  useEffect(() => {
    trackView(productId, 5000); // 5 seconds
  }, [productId, trackView]);

  const handleLike = () => {
    toggleLike(productId);
  };

  const handleAddToCart = () => {
    trackAddToCart({
      product_id: productId,
      quantity: 1,
      price: 15000000,
    });
  };

  return (
    <div>
      <button onClick={handleLike}>❤️ Like</button>
      <button onClick={handleAddToCart}>🛒 Add to Cart</button>
    </div>
  );
}
```

### 3️⃣ Track Order (Checkout)

```tsx
import { useTrackInteraction } from '@/features/recommendations';

function CheckoutPage() {
  const { trackOrder } = useTrackInteraction();

  const handleCompleteOrder = async () => {
    await trackOrder({
      total_amount: 45000000,
      items: [
        { laptop_id: 'prod_123', quantity: 1, price: 25000000 },
        { laptop_id: 'prod_456', quantity: 2, price: 10000000 },
      ],
      shipping_address: '123 ABC Street, HCMC',
      payment_method: 'credit_card',
    });
  };

  return <button onClick={handleCompleteOrder}>Complete Order</button>;
}
```

### 4️⃣ Track Feedback

```tsx
import { useTrackInteraction } from '@/features/recommendations';

function FeedbackForm({ productId }: { productId: string }) {
  const { trackFeedback } = useTrackInteraction();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const handleSubmit = async () => {
    await trackFeedback({
      product_id: productId,
      rating,
      comment,
      wishlist: false,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="number" value={rating} onChange={e => setRating(+e.target.value)} />
      <textarea value={comment} onChange={e => setComment(e.target.value)} />
      <button type="submit">Submit</button>
    </form>
  );
}
```

## 📊 Metadata & Quality Levels

Backend tự động update profile quality dựa trên số lượng interactions:

| Quality  | Interactions | Màu Badge  | Mô tả |
|----------|-------------|------------|-------|
| `default` | 0-9         | Gray       | Default embedding từ popular products |
| `low`     | 10-29       | Orange     | Basic personalization |
| `medium`  | 30-49       | Yellow     | Good personalization |
| `high`    | 50+         | Green      | Excellent personalization |

## 🎨 UI Components

### RecommendationCard

Hiển thị single product recommendation:

**Features:**
- Product image, name, price
- Brand & specifications preview
- Recommendation score badge (% match)
- Recommendation reason
- Like button
- Add to cart button
- Stock indicator
- Auto-track view on mount

### RecommendationsList

Container hiển thị grid of recommendations:

**Features:**
- Auto-fetch recommendations
- Loading spinner
- Error handling với retry button
- Quality metadata display
- Refresh button
- Empty state
- Quality improvement tips
- Responsive grid (1-4 columns)

## 🔄 Interaction Tracking

### Tự động track các events:

1. **View** - Auto-track khi RecommendationCard render
2. **Like** - Click nút Like
3. **Add to Cart** - Click nút Add to Cart
4. **Remove from Cart** - Xóa item khỏi giỏ
5. **Feedback** - Submit rating/comment
6. **Purchase** - Complete order

### Weights (Backend xử lý):

```javascript
view: 1.0
like: 2.0
add_to_cart: 3.0
rating: 4.0
purchase: 5.0
```

## 🔐 Authentication

API sử dụng JWT token từ `localStorage`:

```typescript
// api.ts
private getHeaders(): HeadersInit {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}
```

**Lưu ý:** Điều chỉnh key `'token'` theo auth system của bạn.

## 🌐 API Endpoints

Tất cả endpoints đều sử dụng `API_URL` từ `@/constants/api-url`:

```typescript
GET  /recommendations?limit=10          // Get recommendations
POST /interactions/view                 // Track view
POST /interactions/like/:productId      // Toggle like
POST /interactions/cart/add             // Track add to cart
DELETE /interactions/cart/:itemId       // Track remove from cart
POST /interactions/feedback             // Track feedback
POST /interactions/order                // Track order
GET  /interactions/history              // Get user interactions
```

## 📦 TypeScript Types

```typescript
interface ProductRecommendation {
  productId: string;
  product: {
    _id: string;
    name: string;
    price: number;
    images: { mainImg: { url: string } };
    specifications: Record<string, any>;
    brand_id?: { name: string };
    stock: number;
  };
  content_score: number;
  collaborative_score?: number;
  final_score: number;
  reason?: string;
}

interface RecommendationMetadata {
  quality: 'default' | 'low' | 'medium' | 'high';
  source: string;
  interaction_count: number;
  base_product_count?: number;
}
```

## 🧪 Testing

### Test Recommendations
```bash
# Start backend
cd backend
npm start

# Start frontend
cd frontend
npm run dev

# Visit http://localhost:3000/recommendations
```

### Check Console Logs
```javascript
 Tracked view: prod_123
 Tracked add to cart: prod_456
 Tracked order: { total_amount: 45000000, ... }
```

## 🎯 Best Practices

1. **Auto-track view** - RecommendationCard tự động track khi render
2. **Không throw errors** - Track interactions không làm break UI
3. **Show quality tips** - Hiển thị tips cho default quality
4. **Responsive design** - Grid responsive 1-4 columns
5. **Loading states** - Hiển thị spinner khi loading
6. **Error recovery** - Retry button khi có lỗi

## 🚀 Phase 2 - Lazy Initialization

Backend **tự động tạo profile** khi user chưa có:

```javascript
// Backend: ensureUserProfile()
if (!userProfile) {
  // Tạo default profile từ top 10 popular products
  userProfile = await createDefaultUserProfile(userId);
}
```

**Lợi ích:**
-  User mới ngay lập tức có recommendations
-  Không cần interactions trước
-  Quality tăng dần theo interactions
-  Smooth UX - không có empty state

## 📚 Documentation Links

- [Backend RECOMMENDATION_SYSTEM_STATUS.md](../../../backend/RECOMMENDATION_SYSTEM_STATUS.md)
- [Backend PHASE2_IMPLEMENTATION_SUMMARY.md](../../../backend/PHASE2_IMPLEMENTATION_SUMMARY.md)

---

**Created:** 2024
**Version:** 2.0 (Phase 2 - Lazy Init)
**Author:** Khoa Luận TN Team
