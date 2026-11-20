import mongoose from 'mongoose';
import Cart from '../models/Cart.js';
import CartItem from '../models/CartItem.js';
import Product from '../models/Product.js';

const toNumber = (val) => {
  if (val == null) return 0;
  if (typeof val === 'number') return val;
  return parseFloat(val.toString()) || 0;
};

const formatCartItem = (item) => {
  const obj = item.toObject ? item.toObject() : item;
  return {
    ...obj,
    price: toNumber(obj.price),
  };
};

// get cart
export const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user_id: req.user._id });
    if (!cart) {
      cart = new Cart({ user_id: req.user._id });
      await cart.save();
    }

    const cartItems = await CartItem.find({ cart_id: cart._id }).populate({
      path: 'laptop_id',
      select: 'title name price images stock sku',
      populate: {
        path: 'brand_id',
        select: 'name',
      },
    });

    // Bỏ qua các item mà sản phẩm gốc đã bị xóa khỏi DB
    const validItems = cartItems.filter((item) => item.laptop_id != null).map(formatCartItem);

    const totalAmount = validItems.reduce((total, item) => {
      return total + toNumber(item.laptop_id?.price ?? item.price) * item.quantity;
    }, 0);

    res.json({
      success: true,
      data: {
        cart_id: cart._id,
        items: validItems,
        total_amount: totalAmount,
        item_count: validItems.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi lấy giỏ hàng',
      error: error.message,
    });
  }
};

// Thêm sp
export const addToCart = async (req, res) => {
  try {
    const { laptop_id, quantity = 1 } = req.body;
    const qty = parseInt(quantity, 10);

    if (!laptop_id || !mongoose.Types.ObjectId.isValid(laptop_id) || !Number.isFinite(qty) || qty <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu sản phẩm hoặc số lượng không hợp lệ',
      });
    }

    const product = await Product.findById(laptop_id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    let cart = await Cart.findOne({ user_id: req.user._id });
    if (!cart) {
      cart = new Cart({ user_id: req.user._id });
      await cart.save();
    }

    const existingItem = await CartItem.findOne({
      cart_id: cart._id,
      laptop_id,
    });

    const targetQty = (existingItem ? existingItem.quantity : 0) + qty;
    if (typeof product.stock === 'number' && targetQty > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Sản phẩm "${product.name}" chỉ còn ${product.stock} sản phẩm trong kho`,
      });
    }

    if (existingItem) {
      existingItem.quantity = targetQty;
      existingItem.price = product.price;
      await existingItem.save();
    } else {
      const cartItem = new CartItem({
        cart_id: cart._id,
        laptop_id,
        quantity: qty,
        price: product.price,
      });
      await cartItem.save();
    }

    res.json({
      success: true,
      message: 'Thêm sản phẩm vào giỏ hàng thành công',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi thêm sản phẩm vào giỏ hàng',
      error: error.message,
    });
  }
};

// Cập nhật số lượng sp (chỉ cho phép sửa item trong giỏ của chính user)
export const updateCartItem = async (req, res) => {
  try {
    const { item_id } = req.params;
    const qty = parseInt(req.body.quantity, 10);

    if (!Number.isFinite(qty) || qty <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Số lượng phải lớn hơn 0',
      });
    }

    const cart = await Cart.findOne({ user_id: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy giỏ hàng',
      });
    }

    const existingItem = await CartItem.findOne({ _id: item_id, cart_id: cart._id });
    if (!existingItem) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm trong giỏ hàng của bạn',
      });
    }

    const product = await Product.findById(existingItem.laptop_id);
    if (product && typeof product.stock === 'number' && qty > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Sản phẩm "${product.name}" chỉ còn ${product.stock} sản phẩm trong kho`,
      });
    }

    existingItem.quantity = qty;
    if (product) existingItem.price = product.price;
    await existingItem.save();
    await existingItem.populate('laptop_id', 'title name price images stock');

    res.json({
      success: true,
      message: 'Cập nhật số lượng sản phẩm thành công',
      data: formatCartItem(existingItem),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật số lượng sản phẩm',
      error: error.message,
    });
  }
};

// Xóa sp (chỉ cho phép xóa item thuộc giỏ của chính user)
export const removeFromCart = async (req, res) => {
  try {
    const { item_id } = req.params;

    const cart = await Cart.findOne({ user_id: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy giỏ hàng',
      });
    }

    const cartItem = await CartItem.findOneAndDelete({
      _id: item_id,
      cart_id: cart._id,
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm trong giỏ hàng của bạn',
      });
    }

    res.json({
      success: true,
      message: 'Xóa sản phẩm thành công',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Xóa sp theo product_id (laptop_id) trong giỏ của chính user
export const removeProductFromCart = async (req, res) => {
  try {
    const { product_id } = req.params;
    if (!product_id || !mongoose.Types.ObjectId.isValid(product_id)) {
      return res.status(400).json({
        success: false,
        message: 'Mã sản phẩm không hợp lệ',
      });
    }

    const cart = await Cart.findOne({ user_id: req.user._id });
    if (!cart) {
      return res.json({
        success: true,
        message: 'Giỏ hàng đã trống',
      });
    }

    await CartItem.deleteMany({
      cart_id: cart._id,
      laptop_id: product_id,
    });

    res.json({
      success: true,
      message: 'Xóa sản phẩm khỏi giỏ hàng thành công',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa sản phẩm khỏi giỏ hàng',
      error: error.message,
    });
  }
};

// Xóa toàn bộ giỏ hàng của người dùng
export const clearUserCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user_id: req.user._id });
    if (!cart) {
      return res.json({
        success: true,
        message: 'Giỏ hàng đã trống.',
      });
    }

    await CartItem.deleteMany({ cart_id: cart._id });

    res.json({
      success: true,
      message: 'Giỏ hàng đã được xóa thành công.',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa giỏ hàng',
      error: error.message,
    });
  }
};

// Cập nhật toàn bộ giỏ hàng của người dùng
export const updateUserCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { items } = req.body;

    if (!Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        message: 'Danh sách sản phẩm giỏ hàng không hợp lệ',
      });
    }

    // Gộp các laptop_id bị trùng và chuẩn hóa số lượng >= 1
    const mergedMap = new Map();
    for (const item of items) {
      const id = item?.laptop_id;
      const qty = parseInt(item?.quantity, 10);
      if (!id || !mongoose.Types.ObjectId.isValid(id) || !Number.isFinite(qty) || qty <= 0) {
        continue;
      }
      const key = String(id);
      mergedMap.set(key, (mergedMap.get(key) || 0) + qty);
    }

    let cart = await Cart.findOne({ user_id: userId });
    if (!cart) {
      cart = new Cart({ user_id: userId });
      await cart.save();
    }

    // Kiểm tra sản phẩm tồn tại và đồng bộ giá (không chặn việc xóa sp khác nếu 1 sp còn lại hết hàng)
    const newCartItems = [];
    for (const [laptopId, qty] of mergedMap.entries()) {
      const product = await Product.findById(laptopId);
      if (!product) {
        console.warn(`Product with ID ${laptopId} not found. Skipping.`);
        continue;
      }
      const finalQty =
        typeof product.stock === 'number' && product.stock > 0
          ? Math.min(qty, product.stock)
          : qty;
      newCartItems.push({
        cart_id: cart._id,
        laptop_id: laptopId,
        quantity: finalQty,
        price: product.price,
      });
    }

    await CartItem.deleteMany({ cart_id: cart._id });
    if (newCartItems.length > 0) {
      await CartItem.insertMany(newCartItems);
    }

    res.json({
      success: true,
      message: 'Giỏ hàng đã được cập nhật thành công.',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật giỏ hàng',
      error: error.message,
    });
  }
};
