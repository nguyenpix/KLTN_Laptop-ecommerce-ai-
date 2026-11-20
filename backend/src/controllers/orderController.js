import mongoose from 'mongoose';
import Order from '../models/Order.js';
import OrderItem from '../models/OrderItem.js';
import Cart from '../models/Cart.js';
import CartItem from '../models/CartItem.js';
import Product from '../models/Product.js';
import Interaction from '../models/Interaction.js';
import userProfileService from '../services/userProfileService.js';

const SHIPPING_FEE = 100000;
const TAX_RATE = 0.08;

const toNumber = (val) => {
  if (val == null) return 0;
  if (typeof val === 'number') return val;
  return parseFloat(val.toString()) || 0;
};

const formatOrderItem = (item) => {
  const obj = item.toObject ? item.toObject() : item;
  return {
    ...obj,
    price: toNumber(obj.price),
  };
};

// Hoàn lại tồn kho cho danh sách { laptop_id, quantity }
const restoreStockForItems = async (items) => {
  for (const item of items) {
    const productId = item.laptop_id?._id || item.laptop_id;
    const qty = Number(item.quantity) || 0;
    if (productId && qty > 0) {
      await Product.findByIdAndUpdate(productId, { $inc: { stock: qty } });
    }
  }
};

// Tạo đơn hàng từ giỏ hàng (lấy giá từ DB, kiểm tra và trừ tồn kho nguyên tử)
export const createOrder = async (req, res) => {
  const decrementedItems = [];
  try {
    const { shipping_address, payment_method, order_items } = req.body;
    const userId = req.user._id;

    if (
      !shipping_address ||
      !String(shipping_address).trim() ||
      !payment_method ||
      !Array.isArray(order_items) ||
      order_items.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu đơn hàng không hợp lệ.',
      });
    }

    // Gộp các sản phẩm trùng lặp trong order_items
    const qtyMap = new Map();
    for (const rawItem of order_items) {
      const id = rawItem?.laptop_id;
      const qty = parseInt(rawItem?.quantity, 10);
      if (!id || !mongoose.Types.ObjectId.isValid(id) || !Number.isFinite(qty) || qty <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Thông tin sản phẩm hoặc số lượng đặt mua không hợp lệ.',
        });
      }
      const key = String(id);
      qtyMap.set(key, (qtyMap.get(key) || 0) + qty);
    }

    // Kiểm tra và trừ tồn kho nguyên tử từng sản phẩm, lấy giá trực tiếp từ DB
    const verifiedItems = [];
    let subtotal = 0;

    for (const [laptopId, qty] of qtyMap.entries()) {
      const updatedProduct = await Product.findOneAndUpdate(
        { _id: laptopId, stock: { $gte: qty } },
        { $inc: { stock: -qty } },
        { new: true }
      );

      if (!updatedProduct) {
        // Hoàn lại kho cho các sản phẩm đã trừ trước đó
        await restoreStockForItems(decrementedItems);

        const existingProduct = await Product.findById(laptopId).select('name title stock');
        if (!existingProduct) {
          return res.status(404).json({
            success: false,
            message: 'Một sản phẩm trong giỏ hàng không còn tồn tại.',
          });
        }
        return res.status(400).json({
          success: false,
          message: `Sản phẩm "${existingProduct.title || existingProduct.name}" chỉ còn ${existingProduct.stock} sản phẩm trong kho (bạn đặt ${qty}).`,
        });
      }

      decrementedItems.push({ laptop_id: updatedProduct._id, quantity: qty });
      const unitPrice = toNumber(updatedProduct.price);
      subtotal += unitPrice * qty;
      verifiedItems.push({
        laptop_id: updatedProduct._id,
        quantity: qty,
        price: unitPrice,
      });
    }

    const taxAmount = Math.round(subtotal * TAX_RATE);
    const totalAmount = subtotal + SHIPPING_FEE + taxAmount;

    const order = new Order({
      user_id: userId,
      total_amount: totalAmount,
      shipping_address: String(shipping_address).trim(),
      payment_method,
      status: 'pending',
    });

    await order.save();

    const itemsToCreate = verifiedItems.map((item) => ({
      order_id: order._id,
      laptop_id: item.laptop_id,
      quantity: item.quantity,
      price: item.price,
    }));

    await OrderItem.insertMany(itemsToCreate);

    // Xóa giỏ hàng của người dùng sau khi tạo đơn thành công
    const cart = await Cart.findOne({ user_id: userId });
    if (cart) {
      await CartItem.deleteMany({ cart_id: cart._id });
    }

    // Ghi nhận hành vi mua hàng (purchase) cho hệ thống gợi ý AI (không chặn response)
    Promise.all(
      verifiedItems.map((item) =>
        Interaction.create({
          userId,
          productId: item.laptop_id,
          type: 'purchase',
          weight: 10.0,
          metadata: {
            quantity: item.quantity,
            price: item.price,
            total_amount: totalAmount,
            order_id: order._id,
          },
        })
      )
    )
      .then(() => userProfileService.calculateUserProfile(userId, { saveToDb: true }))
      .catch((err) => console.error('Error tracking purchase interaction:', err.message));

    res.status(201).json({
      success: true,
      message: 'Đặt hàng thành công',
      data: order,
    });
  } catch (error) {
    // Hoàn kho nếu xảy ra lỗi giữa chừng sau khi đã trừ
    if (decrementedItems.length > 0) {
      await restoreStockForItems(decrementedItems).catch(() => {});
    }
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo đơn hàng',
      error: error.message,
    });
  }
};

// Lấy đơn hàng của người dùng
export const getUserOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;

    const orders = await Order.find({ user_id: req.user._id })
      .populate('user_id', 'name email phone')
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Order.countDocuments({ user_id: req.user._id });

    res.json({
      success: true,
      data: orders,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message,
    });
  }
};

// Lấy chi tiết một đơn hàng (cho phép chính chủ HOẶC admin)
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Mã đơn hàng không hợp lệ',
      });
    }

    const order = await Order.findById(id).populate('user_id', 'name email phone address');
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    const orderOwnerId = order.user_id?._id?.toString() || order.user_id?.toString();
    const requesterId = req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (orderOwnerId !== requesterId && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    const orderItems = await OrderItem.find({ order_id: id }).populate({
      path: 'laptop_id',
      select: 'title name price images sku',
      populate: {
        path: 'brand_id',
        select: 'name',
      },
    });

    res.json({
      success: true,
      data: {
        ...order.toObject(),
        items: orderItems.map(formatOrderItem),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching order',
      error: error.message,
    });
  }
};

// Khách hàng tự hủy đơn hàng khi đang ở trạng thái pending (và hoàn lại tồn kho)
export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Mã đơn hàng không hợp lệ',
      });
    }

    const existingOrder = await Order.findById(id);
    if (!existingOrder) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng',
      });
    }

    const isOwner = existingOrder.user_id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền hủy đơn hàng này',
      });
    }

    if (existingOrder.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Chỉ có thể hủy đơn hàng khi đang ở trạng thái chờ xác nhận (pending).',
      });
    }

    // Cập nhật nguyên tử để tránh hoàn kho 2 lần nếu bấm hủy đồng thời
    const cancelledOrder = await Order.findOneAndUpdate(
      { _id: id, status: 'pending' },
      { status: 'cancelled' },
      { new: true }
    ).populate('user_id', 'name email phone');

    if (!cancelledOrder) {
      return res.status(400).json({
        success: false,
        message: 'Đơn hàng đã được xử lý hoặc hủy trước đó.',
      });
    }

    const orderItems = await OrderItem.find({ order_id: id });
    await restoreStockForItems(orderItems);

    res.json({
      success: true,
      message: 'Hủy đơn hàng thành công',
      data: cancelledOrder,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi hủy đơn hàng',
      error: error.message,
    });
  }
};

// Bảng chuyển đổi trạng thái hợp lệ cho Admin
const ALLOWED_TRANSITIONS = {
  pending: ['confirmed', 'shipping', 'delivered', 'cancelled'],
  confirmed: ['shipping', 'delivered', 'cancelled'],
  shipping: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
};

// Cập nhật trạng thái đơn hàng (chỉ admin) + hoàn kho khi chuyển sang cancelled
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'shipping', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Trạng thái đơn hàng không hợp lệ',
      });
    }

    const existingOrder = await Order.findById(id);
    if (!existingOrder) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (existingOrder.status === status) {
      await existingOrder.populate('user_id', 'name email phone');
      return res.json({
        success: true,
        message: 'Trạng thái đơn hàng không thay đổi',
        data: existingOrder,
      });
    }

    const allowedNext = ALLOWED_TRANSITIONS[existingOrder.status] || [];
    if (!allowedNext.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Không thể chuyển đơn hàng từ trạng thái "${existingOrder.status}" sang "${status}".`,
      });
    }

    // Cập nhật có điều kiện trạng thái cũ để tránh race condition khi hoàn kho
    const order = await Order.findOneAndUpdate(
      { _id: id, status: existingOrder.status },
      { status },
      { new: true, runValidators: true }
    ).populate('user_id', 'name email phone');

    if (!order) {
      return res.status(409).json({
        success: false,
        message: 'Trạng thái đơn hàng vừa được thay đổi bởi thao tác khác, vui lòng tải lại.',
      });
    }

    // Nếu chuyển sang cancelled -> hoàn lại tồn kho
    if (status === 'cancelled') {
      const orderItems = await OrderItem.find({ order_id: id });
      await restoreStockForItems(orderItems);
    }

    res.json({
      success: true,
      message: 'Cập nhật trạng thái đơn hàng thành công',
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating order status',
      error: error.message,
    });
  }
};

// Lấy tất cả đơn hàng (chỉ admin)
export const getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const { status } = req.query;

    const filter = {};
    if (status && status !== 'all') filter.status = status;

    const orders = await Order.find(filter)
      .populate('user_id', 'name email phone')
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Order.countDocuments(filter);

    res.json({
      success: true,
      data: orders,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message,
    });
  }
};
