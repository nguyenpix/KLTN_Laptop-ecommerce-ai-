# 🎯 Frontend Integration Summary - Recommendation System Phase 2

##  Hoàn thành

Đã tích hợp **Recommendation System Phase 2 (Lazy Initialization)** vào Next.js frontend với đầy đủ features.

---

## 📁 Files Created

### 1. **Types & API**
```
frontend/src/features/recommendations/
├── types.ts                  TypeScript type definitions
├── api.ts                    RecommendationsAPI singleton class
└── index.ts                  Main exports
```

### 2. **React Hooks**
```
frontend/src/features/recommendations/hooks/
├── useRecommendations.ts     Hook để fetch recommendations
├── useTrackInteraction.ts    Hook để track user interactions
└── index.ts                  Hooks exports
```

### 3. **UI Components**
```
frontend/src/features/recommendations/components/
├── RecommendationCard.tsx    Single product card
├── RecommendationsList.tsx   Grid container với loading/error states
└── index.ts                  Components exports
```

### 4. **Pages**
```
frontend/src/app/
└── recommendations/
    └── page.tsx              Recommendations page
```

### 5. **Documentation**
```
frontend/src/features/recommendations/
└── README.md                 Complete usage guide
```

---

## 🎨 Components Overview

### 📋 RecommendationsList

**Props:**
- `limit?: number` - Số lượng recommendations (default: 10)
- `title?: string` - Tiêu đề section
- `showMetadata?: boolean` - Hiển thị quality metadata

**Features:**
-  Auto-fetch recommendations khi mount
-  Loading spinner
-  Error handling với retry button
-  Empty state message
-  Quality metadata display (quality, interaction count)
-  Refresh button
-  Quality improvement tips cho default users
-  Responsive grid (1-4 columns)

**Usage:**
```tsx
<RecommendationsList 
  limit={12}
  title="Sản phẩm dành riêng cho bạn"
  showMetadata={true}
/>
```

---

### 🎴 RecommendationCard

**Props:**
- `recommendation: ProductRecommendation`
- `onView?: (productId: string) => void`
- `onLike?: (productId: string) => void`
- `onAddToCart?: (productId: string, price: number) => void`

**Features:**
-  Product image với hover zoom effect
-  Brand label
-  Product name (line-clamp-2)
-  Specifications preview (CPU, RAM)
-  Recommendation score badge (% match)
-  Recommendation reason (💡 icon)
-  Price formatting (Vietnamese đồng)
-  Like button (❤️)
-  Add to cart button
-  Stock indicator (⚠️ warning khi <= 5)
-  Disabled state khi hết hàng
-  Auto-track view on mount

---

## 🎣 Hooks Overview

### 🔄 useRecommendations

**Parameters:**
```typescript
{
  limit?: number;           // Default: 10
  enabled?: boolean;        // Default: true
  refetchOnMount?: boolean; // Default: true
}
```

**Returns:**
```typescript
{
  recommendations: ProductRecommendation[];
  isLoading: boolean;
  error: Error | null;
  metadata: RecommendationMetadata | null;
  refetch: () => Promise<void>;
}
```

**Features:**
-  Auto-fetch on mount (configurable)
-  Manual refetch
-  Loading state
-  Error handling
-  Metadata extraction (quality, interaction count, etc.)

**Usage:**
```tsx
const { recommendations, isLoading, error, metadata, refetch } = useRecommendations({
  limit: 10,
  enabled: true,
});
```

---

### 📊 useTrackInteraction

**Returns:**
```typescript
{
  trackView: (productId: string, duration?: number) => Promise<void>;
  trackAddToCart: (payload: Omit<TrackCartPayload, 'action'>) => Promise<void>;
  trackRemoveFromCart: (itemId: string) => Promise<void>;
  toggleLike: (productId: string) => Promise<void>;
  trackFeedback: (payload: TrackFeedbackPayload) => Promise<void>;
  trackOrder: (payload: TrackOrderPayload) => Promise<void>;
}
```

**Features:**
-  All tracking methods are `async` but **không throw errors**
-  Console logs để debug ( success,  error)
-  Không làm break UI khi API fail
-  Callbacks wrapped trong `useCallback` để optimize re-renders

**Usage:**
```tsx
const { trackView, toggleLike, trackAddToCart } = useTrackInteraction();

// Auto-track view
useEffect(() => {
  trackView(productId, 5000); // 5 seconds
}, [productId, trackView]);

// Like button
const handleLike = () => toggleLike(productId);

// Add to cart
const handleAddToCart = () => {
  trackAddToCart({ product_id: productId, quantity: 1, price: 15000000 });
};
```

---

## 🔌 API Client

### RecommendationsAPI (Singleton)

**Methods:**
1. `getRecommendations(limit)` - GET recommendations
2. `trackView(payload)` - Track view interaction
3. `toggleLike(productId)` - Like/Unlike product
4. `trackAddToCart(payload)` - Track add to cart
5. `trackRemoveFromCart(itemId)` - Track remove from cart
6. `trackFeedback(payload)` - Track rating/feedback
7. `trackOrder(payload)` - Track completed order
8. `getUserInteractions()` - Get interaction history

**Authentication:**
```typescript
private getHeaders(): HeadersInit {
  const token = this.getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}
```

**API Base URL:**
```typescript
import { API_URL } from '@/constants/api-url';
// API_URL = 'http://localhost:5000/api/v1'
```

---

## 📊 TypeScript Types

### Core Types
```typescript
interface ProductRecommendation {
  productId: string;
  product: {
    _id: string;
    name: string;
    price: number;
    images: { mainImg: { url: string } };
    specifications: Record<string, any>;
    brand_id?: { _id: string; name: string };
    category_id?: Array<{ _id: string; name: string }>;
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

### Interaction Payloads
```typescript
interface TrackViewPayload {
  product_id: string;
  duration?: number;
  source?: string;
}

interface TrackCartPayload {
  product_id: string;
  quantity: number;
  price?: number;
}

interface TrackFeedbackPayload {
  product_id: string;
  rating: number;
  comment: string;
  wishlist?: boolean;
}

interface TrackOrderPayload {
  total_amount: number;
  items: Array<{
    laptop_id: string;
    quantity: number;
    price: number;
  }>;
  shipping_address: string;
  payment_method: string;
}
```

---

## 🎯 Quality Levels & Progression

| Quality  | Interactions | Màu Badge | Mô tả |
|----------|-------------|-----------|-------|
| `default` | 0-9         | Gray      | Default embedding từ popular products |
| `low`     | 10-29       | Orange    | Basic personalization |
| `medium`  | 30-49       | Yellow    | Good personalization |
| `high`    | 50+         | Green     | Excellent personalization |

**Backend tự động:**
-  Tạo profile mới với quality = `'default'`
-  Update quality sau mỗi 10/30/50 interactions
-  Re-generate embedding khi quality lên level mới

---

## 🚀 Integration Examples

### 1️⃣ Homepage - Recommendations Widget
```tsx
import { RecommendationsList } from '@/features/recommendations';

export default function HomePage() {
  return (
    <div>
      {/* Other sections */}
      <RecommendationsList 
        limit={8}
        title="Dành riêng cho bạn"
        showMetadata={false}
      />
    </div>
  );
}
```

### 2️⃣ Product Detail Page - Auto Track View
```tsx
import { useTrackInteraction } from '@/features/recommendations';

export default function ProductPage({ params }: { params: { id: string } }) {
  const { trackView } = useTrackInteraction();

  useEffect(() => {
    // Auto-track view với duration = 5s
    trackView(params.id, 5000);
  }, [params.id, trackView]);

  return <div>Product Details</div>;
}
```

### 3️⃣ Cart Page - Track Add/Remove
```tsx
import { useTrackInteraction } from '@/features/recommendations';

export default function CartPage() {
  const { trackAddToCart, trackRemoveFromCart } = useTrackInteraction();

  const handleAddToCart = async (product) => {
    // Add to cart logic
    await addToCart(product);

    // Track interaction
    await trackAddToCart({
      product_id: product._id,
      quantity: 1,
      price: product.price,
    });
  };

  const handleRemoveItem = async (itemId) => {
    await removeFromCart(itemId);
    await trackRemoveFromCart(itemId);
  };

  return <div>Cart Items</div>;
}
```

### 4️⃣ Checkout Success - Track Order
```tsx
import { useTrackInteraction } from '@/features/recommendations';

export default function CheckoutSuccessPage({ order }) {
  const { trackOrder } = useTrackInteraction();

  useEffect(() => {
    // Track order sau khi complete
    trackOrder({
      total_amount: order.total_amount,
      items: order.items.map(item => ({
        laptop_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
      })),
      shipping_address: order.shipping_address,
      payment_method: order.payment_method,
    });
  }, [order]);

  return <div>Order Success!</div>;
}
```

### 5️⃣ Product Review Form - Track Feedback
```tsx
import { useTrackInteraction } from '@/features/recommendations';

export default function ReviewForm({ productId }) {
  const { trackFeedback } = useTrackInteraction();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await trackFeedback({
      product_id: productId,
      rating,
      comment,
      wishlist: false,
    });
    alert('Cảm ơn bạn đã đánh giá!');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="number" value={rating} onChange={e => setRating(+e.target.value)} />
      <textarea value={comment} onChange={e => setComment(e.target.value)} />
      <button type="submit">Gửi đánh giá</button>
    </form>
  );
}
```

---

## 🧪 Testing

### 1. Start Backend
```bash
cd backend
npm start
# Backend chạy tại http://localhost:5000
```

### 2. Start Frontend
```bash
cd frontend
npm run dev
# Frontend chạy tại http://localhost:3000
```

### 3. Test Flow

1. **Visit Recommendations Page:**
   ```
   http://localhost:3000/recommendations
   ```
   - Nếu user chưa có profile → Backend tự tạo với quality `'default'`
   - Hiển thị 12 recommendations
   - Metadata hiển thị: Quality, Interaction count

2. **Interact với Products:**
   - Click "Like" button → Track like interaction
   - Click "Add to Cart" → Track add_to_cart interaction
   - View product detail → Track view interaction

3. **Check Console Logs:**
   ```javascript
    Tracked view: 507f1f77bcf86cd799439011
    Tracked add to cart: 507f1f77bcf86cd799439011
    Tracked like toggle: 507f1f77bcf86cd799439011
   ```

4. **Verify Quality Progression:**
   - 0-9 interactions → `default` (gray badge)
   - 10 interactions → `low` (orange badge)
   - 30 interactions → `medium` (yellow badge)
   - 50+ interactions → `high` (green badge)

---

## 📈 Next Steps (Optional Enhancements)

### 1. **Recommendation Widget cho Homepage**
```tsx
// components/RecommendationsWidget.tsx
export function RecommendationsWidget() {
  return (
    <section className="bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <RecommendationsList 
          limit={4}
          title="Có thể bạn sẽ thích"
          showMetadata={false}
        />
      </div>
    </section>
  );
}
```

### 2. **Similar Products Section**
```tsx
// On product detail page
<RecommendationsList 
  limit={4}
  title="Sản phẩm tương tự"
  showMetadata={false}
/>
```

### 3. **User Dashboard - Interaction History**
```tsx
import { recommendationsAPI } from '@/features/recommendations';

export default function UserDashboard() {
  const [interactions, setInteractions] = useState([]);

  useEffect(() => {
    recommendationsAPI.getUserInteractions()
      .then(response => setInteractions(response.data.interactions));
  }, []);

  return (
    <div>
      <h2>Lịch sử tương tác</h2>
      {interactions.map(int => (
        <div key={int._id}>
          {int.type}: {int.productId.name}
        </div>
      ))}
    </div>
  );
}
```

### 4. **Real-time View Duration Tracking**
```tsx
function ProductPage({ productId }) {
  const { trackView } = useTrackInteraction();
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    return () => {
      // Track actual duration khi user rời trang
      const duration = Date.now() - startTimeRef.current;
      trackView(productId, duration);
    };
  }, [productId, trackView]);
}
```

---

##  Checklist

### Backend 
- [x] Lazy initialization implemented
- [x] Default user profile creation
- [x] Quality progression (default → low → medium → high)
- [x] All API endpoints working
- [x] Vector Search index configured
- [x] 196 products with stock & embeddings

### Frontend 
- [x] TypeScript types defined
- [x] API client created
- [x] useRecommendations hook
- [x] useTrackInteraction hook
- [x] RecommendationCard component
- [x] RecommendationsList component
- [x] Recommendations page
- [x] README documentation

### Integration 
- [x] Auto-track view on card render
- [x] Like button tracking
- [x] Add to cart tracking
- [x] Error handling (không break UI)
- [x] Loading states
- [x] Empty states
- [x] Responsive design

---

## 🎉 Kết luận

 **Frontend Integration HOÀN THÀNH**

Hệ thống recommendation đã sẵn sàng sử dụng với:
- 🎯 Lazy initialization (tự động tạo profile)
- 📊 Quality progression (4 levels)
- 🔄 Auto-tracking (view, like, cart, order, feedback)
- 🎨 Beautiful UI components
- 📱 Responsive design
- ⚡ Optimized performance
- 🛡️ Type-safe với TypeScript

**Chỉ cần:**
1. Start backend: `npm start`
2. Start frontend: `npm run dev`
3. Visit: `http://localhost:3000/recommendations`

---

**Created:** 2024
**Version:** Phase 2 - Frontend Integration Complete
**Author:** Khoa Luận TN Team
