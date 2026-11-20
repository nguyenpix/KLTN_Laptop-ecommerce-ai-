import assert from 'node:assert/strict';
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import v1Routes from '../routes/v1/index.js';
import { errorHandler, notFound } from '../middlewares/errorHandler.js';

import User from '../models/User.js';
import Product from '../models/Product.js';
import Cart from '../models/Cart.js';
import CartItem from '../models/CartItem.js';
import Order from '../models/Order.js';
import OrderItem from '../models/OrderItem.js';
import Feedback from '../models/Feedback.js';
import Interaction from '../models/Interaction.js';
import '../models/Brand.js';
import '../models/Category.js';
import '../models/Color.js';

dotenv.config({ path: new URL('../../.env', import.meta.url) });

const runId = Date.now();
const testEmails = [
  `smoketest_a_${runId}@example.com`,
  `smoketest_b_${runId}@example.com`,
  `smoketest_admin_${runId}@example.com`,
];

async function api(baseUrl, path, { method = 'GET', token, body } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, json };
}

async function main() {
  if (!process.env.MONGODB_URI) {
    throw new Error('Missing MONGODB_URI in backend/.env');
  }

  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
  console.log('✓ Connected to MongoDB');

  const app = express();
  app.use(express.json());
  app.use('/api/v1', v1Routes);
  app.use(notFound);
  app.use(errorHandler);

  const server = await new Promise((resolve) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
  });
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}/api/v1`;

  const createdUserIds = [];
  const createdOrderIds = [];
  let testProduct = null;
  let originalStock = null;

  try {
    // Chọn 2 sản phẩm có sẵn trong DB (stock >= 5)
    const products = await Product.find({ stock: { $gte: 5 } }).limit(2).lean();
    assert.ok(products.length >= 2, 'Cần tối thiểu 2 sản phẩm có stock >= 5 trong DB để test');
    const [p1, p2] = products;
    testProduct = p1;
    originalStock = p1.stock;

    // 1. Đăng ký User A, User B, và tạo Admin tạm
    const regA = await api(baseUrl, '/users/register', {
      method: 'POST',
      body: { name: 'Smoke User A', email: testEmails[0], password: 'Password123!' },
    });
    assert.equal(regA.status, 201, `Register A failed: ${JSON.stringify(regA.json)}`);
    const tokenA = regA.json.data.token;
    const userAId = regA.json.data.user.id || regA.json.data.user._id;
    createdUserIds.push(userAId);

    const regB = await api(baseUrl, '/users/register', {
      method: 'POST',
      body: { name: 'Smoke User B', email: testEmails[1], password: 'Password123!' },
    });
    assert.equal(regB.status, 201, `Register B failed: ${JSON.stringify(regB.json)}`);
    const tokenB = regB.json.data.token;
    const userBId = regB.json.data.user.id || regB.json.data.user._id;
    createdUserIds.push(userBId);

    const regAdmin = await api(baseUrl, '/users/register', {
      method: 'POST',
      body: { name: 'Smoke Admin', email: testEmails[2], password: 'Password123!' },
    });
    assert.equal(regAdmin.status, 201);
    const tokenAdmin = regAdmin.json.data.token;
    const adminId = regAdmin.json.data.user.id || regAdmin.json.data.user._id;
    createdUserIds.push(adminId);
    await User.findByIdAndUpdate(adminId, { role: 'admin' });
    console.log('✓ [1] Registered User A, User B, and temporary Admin');

    // 2. Cart Isolation & Ownership Check
    const putCartA = await api(baseUrl, '/cart', {
      method: 'PUT',
      token: tokenA,
      body: {
        items: [
          { laptop_id: p1._id, quantity: 2 },
          { laptop_id: p2._id, quantity: 1 },
        ],
      },
    });
    assert.equal(putCartA.status, 200);

    const getCartA = await api(baseUrl, '/cart', { token: tokenA });
    assert.equal(getCartA.status, 200);
    assert.equal(getCartA.json.data.items.length, 2);
    assert.equal(typeof getCartA.json.data.items[0].price, 'number', 'CartItem.price phải là number');

    const getCartBEmpty = await api(baseUrl, '/cart', { token: tokenB });
    assert.equal(getCartBEmpty.status, 200);
    assert.equal(getCartBEmpty.json.data.items.length, 0, 'User B mới tạo phải có giỏ rỗng');

    // User B thử sửa/xóa CartItem của User A -> phải bị chặn 404
    const cartItemOfA = getCartA.json.data.items[0]._id;
    const crossUpdate = await api(baseUrl, `/cart/items/${cartItemOfA}`, {
      method: 'PUT',
      token: tokenB,
      body: { quantity: 1 },
    });
    assert.equal(crossUpdate.status, 404, 'User B không được sửa CartItem của User A');

    const crossDelete = await api(baseUrl, `/cart/items/${cartItemOfA}`, {
      method: 'DELETE',
      token: tokenB,
    });
    assert.equal(crossDelete.status, 404, 'User B không được xóa CartItem của User A');

    // User B thêm 1 SP -> kiểm tra giỏ A vẫn nguyên 2 SP
    await api(baseUrl, '/cart', {
      method: 'PUT',
      token: tokenB,
      body: { items: [{ laptop_id: p2._id, quantity: 1 }] },
    });
    // User B xóa sản phẩm bằng DELETE /cart/product/:product_id
    const delProdB = await api(baseUrl, `/cart/product/${p2._id}`, {
      method: 'DELETE',
      token: tokenB,
    });
    assert.equal(delProdB.status, 200);
    const getCartBAfterDel = await api(baseUrl, '/cart', { token: tokenB });
    assert.equal(getCartBAfterDel.json.data.items.length, 0, 'Giỏ User B phải trống sau khi xóa bằng DELETE /cart/product/:product_id');

    const getCartAAfter = await api(baseUrl, '/cart', { token: tokenA });
    assert.equal(getCartAAfter.json.data.items.length, 2, 'Giỏ User A không bị ảnh hưởng bởi User B');
    console.log('✓ [2] Cart isolation, Decimal128->Number, DELETE /cart/product/:id & cross-user ownership passed');

    // 3. Wishlist & Feedback (Hồi quy lỗi 403 String !== ObjectId)
    const addWish = await api(baseUrl, '/feedbacks', {
      method: 'POST',
      token: tokenA,
      body: { product_id: p1._id, rating: 0, wishlist: true },
    });
    assert.equal(addWish.status, 201);
    const fbId = addWish.json.data._id;

    // Bỏ yêu thích -> trước đây luôn trả 403!
    const toggleOff = await api(baseUrl, `/feedbacks/wishlist/${fbId}`, {
      method: 'POST',
      token: tokenA,
    });
    assert.equal(toggleOff.status, 200, `Toggle wishlist failed: ${JSON.stringify(toggleOff.json)}`);
    assert.equal(toggleOff.json.data.wishlist, false);

    // Gửi đánh giá thật trên sản phẩm đã từng lưu wishlist -> phải tự cập nhật thành công
    const postReview = await api(baseUrl, '/feedbacks', {
      method: 'POST',
      token: tokenA,
      body: { product_id: p1._id, rating: 5, comment: 'Laptop chạy rất mượt!' },
    });
    assert.ok(postReview.status === 200 || postReview.status === 201);

    // Chủ tài khoản sửa đánh giá -> 200 (trước đây lỗi 403!)
    const editOwnReview = await api(baseUrl, `/feedbacks/${fbId}`, {
      method: 'PUT',
      token: tokenA,
      body: { rating: 4, comment: 'Rất tốt sau 1 tuần sử dụng' },
    });
    assert.equal(editOwnReview.status, 200, `Edit own review failed: ${JSON.stringify(editOwnReview.json)}`);

    // User B cố sửa đánh giá của User A -> PHẢI bị chặn 403
    const editOtherReview = await api(baseUrl, `/feedbacks/${fbId}`, {
      method: 'PUT',
      token: tokenB,
      body: { rating: 1, comment: 'Hack' },
    });
    assert.equal(editOtherReview.status, 403);

    // Lấy danh sách đánh giá sản phẩm -> kiểm tra có `user_id.name`
    const prodFeedbacks = await api(baseUrl, `/feedbacks/product/${p1._id}`);
    assert.equal(prodFeedbacks.status, 200);
    const foundReview = prodFeedbacks.json.data.feedbacks.find((f) => f._id === fbId);
    assert.ok(foundReview, 'Review mới phải xuất hiện trong danh sách');
    assert.equal(foundReview.user_id.name, 'Smoke User A');

    // Chủ tài khoản xóa đánh giá -> 200
    const delOwnReview = await api(baseUrl, `/feedbacks/${fbId}`, {
      method: 'DELETE',
      token: tokenA,
    });
    assert.equal(delOwnReview.status, 200);
    console.log('✓ [3] Wishlist toggle & Feedback CRUD ownership (403 fix) passed');

    // 4. Order: Stock check, Server-side price, Admin detail (403 fix), Cancel & Restock
    const overOrder = await api(baseUrl, '/orders', {
      method: 'POST',
      token: tokenA,
      body: {
        shipping_address: '123 Test St',
        payment_method: 'cod',
        order_items: [{ laptop_id: p1._id, quantity: originalStock + 5 }],
      },
    });
    assert.equal(overOrder.status, 400, 'Đặt quá số lượng tồn kho phải trả 400');

    const validOrder = await api(baseUrl, '/orders', {
      method: 'POST',
      token: tokenA,
      body: {
        shipping_address: '123 Test St, HCM',
        payment_method: 'cod',
        total_amount: 1, // Thử giả mạo tổng tiền = 1đ -> backend phải bỏ qua
        order_items: [{ laptop_id: p1._id, quantity: 2, price: 1 }],
      },
    });
    assert.equal(validOrder.status, 201, `Create order failed: ${JSON.stringify(validOrder.json)}`);
    const orderId = validOrder.json.data._id;
    createdOrderIds.push(orderId);

    const expectedSubtotal = p1.price * 2;
    const expectedTotal = expectedSubtotal + 100000 + Math.round(expectedSubtotal * 0.08);
    assert.equal(validOrder.json.data.total_amount, expectedTotal, 'Backend phải tự tính total_amount từ DB');

    // Kiểm tra tồn kho đã giảm đúng 2
    const afterOrderProduct = await Product.findById(p1._id).lean();
    assert.equal(afterOrderProduct.stock, originalStock - 2, 'Tồn kho phải giảm 2 sau khi đặt');

    // Kiểm tra giỏ hàng User A đã tự động được xóa
    const cartAAfterOrder = await api(baseUrl, '/cart', { token: tokenA });
    assert.equal(cartAAfterOrder.json.data.items.length, 0, 'Giỏ hàng phải trống sau khi đặt hàng');

    // User B không được xem đơn hàng của User A (403)
    const otherViewOrder = await api(baseUrl, `/orders/${orderId}`, { token: tokenB });
    assert.equal(otherViewOrder.status, 403);

    // Admin XEM ĐƯỢC chi tiết đơn hàng của User A (200, trước đây bị 403!)
    const adminViewOrder = await api(baseUrl, `/orders/${orderId}`, { token: tokenAdmin });
    assert.equal(adminViewOrder.status, 200, `Admin view order failed: ${JSON.stringify(adminViewOrder.json)}`);
    assert.equal(typeof adminViewOrder.json.data.items[0].price, 'number');
    assert.ok(adminViewOrder.json.data.items[0].laptop_id.images?.mainImg?.url, 'Phải populate images cho laptop_id');

    // User A tự hủy đơn hàng pending -> 200 và hoàn kho về đúng originalStock
    const cancelRes = await api(baseUrl, `/orders/${orderId}/cancel`, {
      method: 'PUT',
      token: tokenA,
    });
    assert.equal(cancelRes.status, 200, `Cancel order failed: ${JSON.stringify(cancelRes.json)}`);
    assert.equal(cancelRes.json.data.status, 'cancelled');

    const afterCancelProduct = await Product.findById(p1._id).lean();
    assert.equal(afterCancelProduct.stock, originalStock, 'Tồn kho phải được hoàn lại sau khi hủy đơn');

    // Admin không được đổi trạng thái đơn đã cancelled -> 400
    const badTransition = await api(baseUrl, `/orders/${orderId}/status`, {
      method: 'PUT',
      token: tokenAdmin,
      body: { status: 'confirmed' },
    });
    assert.equal(badTransition.status, 400, 'Không được chuyển trạng thái từ cancelled sang confirmed');
    console.log('✓ [4] Order stock validation, server-side pricing, Admin detail & cancel restock passed');

    // 5. Product Search & Hardware Filters + Negative stock protection
    const keyword = (p1.name || p1.title).split(' ')[0];
    const searchRes = await api(baseUrl, `/products?search=${encodeURIComponent(keyword)}&limit=5`);
    assert.equal(searchRes.status, 200);
    assert.ok(searchRes.json.data.length > 0, 'Tìm kiếm theo từ khóa phải trả kết quả');

    const hwFilterRes = await api(baseUrl, '/products?ram=16GB&limit=5');
    assert.equal(hwFilterRes.status, 200);

    const negStock = await api(baseUrl, `/products/${p1._id}`, {
      method: 'PUT',
      token: tokenAdmin,
      body: { stock: -5 },
    });
    assert.equal(negStock.status, 400, 'Không được cập nhật stock âm');
    console.log('✓ [5] Product search, hardware filters & updateProduct validation passed');

    console.log('\n🎉 ALL SMOKE TESTS PASSED SUCCESSFULLY!');
  } finally {
    // Dọn dẹp sạch toàn bộ dữ liệu test tạm thời
    if (testProduct && originalStock !== null) {
      await Product.findByIdAndUpdate(testProduct._id, { stock: originalStock }).catch(() => {});
    }
    if (createdOrderIds.length > 0) {
      await OrderItem.deleteMany({ order_id: { $in: createdOrderIds } }).catch(() => {});
      await Order.deleteMany({ _id: { $in: createdOrderIds } }).catch(() => {});
    }
    if (createdUserIds.length > 0) {
      const carts = await Cart.find({ user_id: { $in: createdUserIds } }).select('_id');
      const cartIds = carts.map((c) => c._id);
      if (cartIds.length > 0) {
        await CartItem.deleteMany({ cart_id: { $in: cartIds } }).catch(() => {});
        await Cart.deleteMany({ _id: { $in: cartIds } }).catch(() => {});
      }
      await Feedback.deleteMany({ user_id: { $in: createdUserIds } }).catch(() => {});
      await Interaction.deleteMany({ userId: { $in: createdUserIds } }).catch(() => {});
      await User.deleteMany({ _id: { $in: createdUserIds } }).catch(() => {});
    }
    server.close();
    await mongoose.disconnect();
  }
}

main().catch((err) => {
  console.error('❌ SMOKE TEST FAILED:', err);
  process.exit(1);
});
