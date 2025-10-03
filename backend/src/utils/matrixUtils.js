import { Matrix } from 'ml-matrix';
import Feedback from '../models/Feedback.js';
import CartItem from '../models/CartItem.js';
import OrderItem from '../models/OrderItem.js';
import Cart from '../models/Cart.js';
import Order from '../models/Order.js';

async function buildUserItemMatrix() {
  const feedbacks = await Feedback.find();
  const carts = await Cart.find();
  const cartItems = await CartItem.find({ cart_id: { $in: carts.map(c => c._id) } });
  const orders = await Order.find({ status: { $in: ['confirmed', 'delivered'] } });
  const orderItems = await OrderItem.find({ order_id: { $in: orders.map(o => o._id) } });

  const users = [...new Set([
    ...feedbacks.map(f => f.user_id.toString()),
    ...carts.map(c => c.user_id.toString()),
    ...orders.map(o => o.user_id.toString())
  ])];
  const items = [...new Set([
    ...feedbacks.map(f => f.product_id.toString()),
    ...cartItems.map(c => c.laptop_id.toString()),
    ...orderItems.map(o => o.laptop_id.toString())
  ])];

  const userIndex = new Map(users.map((u, idx) => [u, idx]));
  const itemIndex = new Map(items.map((i, idx) => [i, idx]));

  const matrix = Matrix.zeros(users.length, items.length);

  feedbacks.forEach(f => {
    const uIdx = userIndex.get(f.user_id.toString());
    const iIdx = itemIndex.get(f.product_id.toString());
    matrix.set(uIdx, iIdx, f.rating + (f.wishlist ? 1 : 0));
  });

  cartItems.forEach(c => {
    const cart = carts.find(cart => cart._id.toString() === c.cart_id.toString());
    const uIdx = userIndex.get(cart.user_id.toString());
    const iIdx = itemIndex.get(c.laptop_id.toString());
    matrix.set(uIdx, iIdx, matrix.get(uIdx, iIdx) + c.quantity * 3);
  });

  orderItems.forEach(o => {
    const order = orders.find(ord => ord._id.toString() === o.order_id.toString());
    const uIdx = userIndex.get(order.user_id.toString());
    const iIdx = itemIndex.get(o.laptop_id.toString());
    matrix.set(uIdx, iIdx, matrix.get(uIdx, iIdx) + o.quantity * 10);
  });

  return { matrix, userIndex, itemIndex };
}

export { buildUserItemMatrix };