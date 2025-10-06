import Cart from '../models/Cart.js';
import CartItem from '../models/CartItem.js';
import Product from '../models/Product.js';

// get cart
export const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user_id: req.user.id });
    // k có thì tạo
    if (!cart) {
      cart = new Cart({ user_id: req.user.id });
      await cart.save();
    }

    const cartItems = await CartItem.find({ cart_id: cart._id }).populate({
      path: "laptop_id",
      select: "name price images", // Thêm images vào đây
      populate: {
        path: "brand_id",
        select: "name",
      },
    });

    const totalAmount = cartItems.reduce((total, item) => {
      return total + (parseFloat(item.price) * item.quantity);
    }, 0);

    res.json({
      success: true,
      data: {
        cart_id: cart._id,
        items: cartItems,
        total_amount: totalAmount,
        item_count: cartItems.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi lấy giỏ hàng',
      error: error.message
    });
  }
};

// Thêm sp
export const addToCart = async (req, res) => {
  try {
    const { laptop_id, quantity = 1 } = req.body;

    // Kiểm tra 
    const product = await Product.findById(laptop_id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // get
    let cart = await Cart.findOne({ user_id: req.user.id });
    // Nếu k có thì create
    if (!cart) {
      cart = new Cart({ user_id: req.user.id });
      await cart.save();
    }

    // Check sp có hay chưa 
    const existingItem = await CartItem.findOne({
      cart_id: cart._id,
      laptop_id: laptop_id
    });
    // nếu có thì tăng sl 
    if (existingItem) {
      existingItem.quantity += quantity;
      await existingItem.save();
    } else {
      // nếu k có thì tạo mới
      const cartItem = new CartItem({
        cart_id: cart._id,
        laptop_id: laptop_id,
        quantity: quantity,
        price: product.price
      });
      await cartItem.save();
    }

    res.json({
      success: true,
      message: 'Thêm sản phẩm vào giỏ hàng thành công'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi thêm sản phẩm vào giỏ hàng',
      error: error.message
    });
  }
};

// Cập nhập số lượng sp( onclick => truyền vào id)
export const updateCartItem = async (req, res) => {
  try {
    const { item_id } = req.params;
    const { quantity } = req.body;
    // Nếu giảm xuống 0
    if (quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Số lượng phải lớn hơn 0'
      });
    }

    const cartItem = await CartItem.findByIdAndUpdate(
      item_id,
      { quantity },
      { new: true }
    ).populate('laptop_id', 'name price');

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy giỏi hàng '
      });
    }

    res.json({
      success: true,
      message: 'Cập nhập số lượng sản phẩm thành công',
      data: cartItem
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhập số lượng sản phẩm',
      error: error.message
    });
  }
};

// Xóa sp ( onclick => truyền vào id)
export const removeFromCart = async (req, res) => {
  try {
    const { item_id } = req.params;

    const cartItem = await CartItem.findByIdAndDelete(item_id);

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      });
    }

    res.json({
      success: true,
      message: 'Sóa sản phẩm thành công'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Xóa toàn bộ giỏ hàng của người dùng
export const clearUserCart = async (req, res) => {
  try {
    const userId = req.user.id;

    // Tìm giỏ hàng của người dùng
    const cart = await Cart.findOne({ user_id: userId });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy giỏ hàng của người dùng.'
      });
    }

    // Xóa tất cả các CartItem liên quan đến giỏ hàng này
    await CartItem.deleteMany({ cart_id: cart._id });

    res.json({
      success: true,
      message: 'Giỏ hàng đã được xóa thành công.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa giỏ hàng',
      error: error.message
    });
  }
};

// Cập nhật toàn bộ giỏ hàng của người dùng
export const updateUserCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { items } = req.body; // items là một mảng các { laptop_id, quantity }

    // Tìm giỏ hàng của người dùng
    let cart = await Cart.findOne({ user_id: userId });

    if (!cart) {
      cart = new Cart({ user_id: userId });
      await cart.save();
    }

    // Xóa tất cả các CartItem hiện có của giỏ hàng này
    await CartItem.deleteMany({ cart_id: cart._id });

    // Thêm các CartItem mới
    const newCartItems = [];
    for (const item of items) {
      const product = await Product.findById(item.laptop_id);
      if (!product) {
        // Nếu sản phẩm không tồn tại, bỏ qua hoặc trả về lỗi
        console.warn(`Product with ID ${item.laptop_id} not found. Skipping.`);
        continue;
      }
      newCartItems.push({
        cart_id: cart._id,
        laptop_id: item.laptop_id,
        quantity: item.quantity,
        price: product.price // Lấy giá hiện tại của sản phẩm
      });
    }

    if (newCartItems.length > 0) {
      await CartItem.insertMany(newCartItems);
    }

    res.json({
      success: true,
      message: 'Giỏ hàng đã được cập nhật thành công.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật giỏ hàng',
      error: error.message
    });
  }
};


