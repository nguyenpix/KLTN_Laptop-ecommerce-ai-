// controllers/interactionController.js
import Feedback from '../models/Feedback.js';
import Cart from '../models/Cart.js';
import CartItem from '../models/CartItem.js';
import Order from '../models/Order.js';
import OrderItem from '../models/OrderItem.js';
import { handleFeedback, handleCartItem, handleOrderItem } from './profileController.js';

async function createFeedback(userId, productId, rating, comment, wishlist = false) {
  const feedback = await Feedback.create({ user_id: userId, product_id: productId, rating, comment, wishlist });
  await handleFeedback(feedback);
  return feedback;
}

async function addToCart(userId, laptopId, quantity, price) {
  let cart = await Cart.findOne({ user_id: userId });
  if (!cart) {
    cart = await Cart.create({ user_id: userId });
  }
  const cartItem = await CartItem.create({ cart_id: cart._id, laptop_id: laptopId, quantity, price });
  await handleCartItem(cartItem);
  return cartItem;
}

async function createOrder(userId, total_amount, shipping_address, payment_method, items) {
  const order = await Order.create({ user_id: userId, total_amount, shipping_address, payment_method });
  const orderItems = await OrderItem.insertMany(
    items.map(item => ({ order_id: order._id, laptop_id: item.laptop_id, quantity: item.quantity, price: item.price }))
  );
  for (const orderItem of orderItems) {
    await handleOrderItem(orderItem);
  }
  return { order, orderItems };
}

export { createFeedback, addToCart, createOrder };