import Order from '../models/Order.js';
import OrderItem from '../models/OrderItem.js';
import Cart from '../models/Cart.js';
import CartItem from '../models/CartItem.js';
import Product from '../models/Product.js';

// Tạo đơn hàng từ giỏ hàng
export const createOrder = async (req, res) => {
  try {
    const { shipping_address, payment_method, total_amount, order_items } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!shipping_address || !payment_method || !total_amount || !order_items || !Array.isArray(order_items) || order_items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order data provided.'
      });
    }

    // Create the main order
    const order = new Order({
      user_id: userId,
      total_amount: total_amount,
      shipping_address: shipping_address,
      payment_method: payment_method,
      status: 'pending',
    });

    await order.save();

    // Create order items from the provided list
    const itemsToCreate = order_items.map(item => ({
      order_id: order._id,
      laptop_id: item.laptop_id,
      quantity: item.quantity,
      price: item.price,
    }));

    await OrderItem.insertMany(itemsToCreate);

    // Clear the user's cart after successful order creation
    const cart = await Cart.findOne({ user_id: userId });
    if (cart) {
      await CartItem.deleteMany({ cart_id: cart._id });
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating order',
      error: error.message,
    });
  }
};

// Lấy đơn hàng của người dùng
export const getUserOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const orders = await Order.find({ user_id: req.user.id })
      .populate('user_id', 'name email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Order.countDocuments({ user_id: req.user.id });

    res.json({
      success: true,
      data: orders,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
};

// Lấy chi tiết một đơn hàng
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id)
      .populate('user_id', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Kiểm tra người dùng có quyền xem đơn hàng này không
    if (order.user_id._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Lấy các sản phẩm trong đơn hàng
    const orderItems = await OrderItem.find({ order_id: id })
      .populate('laptop_id', 'name price')
      .populate({
        path: 'laptop_id',
        populate: {
          path: 'brand_id',
          select: 'name'
        }
      });

    res.json({
      success: true,
      data: {
        ...order.toObject(),
        items: orderItems
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching order',
      error: error.message
    });
  }
};

// Cập nhật trạng thái đơn hàng (chỉ admin)
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'shipping', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    ).populate('user_id', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating order status',
      error: error.message
    });
  }
};

// Lấy tất cả đơn hàng (chỉ admin)
export const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const filter = {};
    if (status) filter.status = status;

    const orders = await Order.find(filter)
      .populate('user_id', 'name email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Order.countDocuments(filter);

    res.json({
      success: true,
      data: orders,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
};
