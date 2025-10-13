import Interaction from '../models/Interaction.js';
import Feedback from '../models/Feedback.js';
import Cart from '../models/Cart.js';
import CartItem from '../models/CartItem.js';
import Order from '../models/Order.js';
import OrderItem from '../models/OrderItem.js';
import Product from '../models/Product.js';
import profileUpdateService from '../services/profileUpdateService.js';

class InteractionController {
  
  /**
   * Track interaction chung - Core method cho recommendation system
   */
  async trackInteraction(req, res) {
    try {
      const { productId, type, metadata = {} } = req.body;
      const userId = req.user.id;

      // Validate input
      if (!productId || !type) {
        return res.status(400).json({
          success: false,
          message: 'productId và type là bắt buộc'
        });
      }

      // Validate product exists
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy sản phẩm'
        });
      }

      // Calculate weight
      const baseWeight = profileUpdateService.INTERACTION_WEIGHTS[type] || 1;
      const adjustedWeight = profileUpdateService.calculateAdjustedWeight(type, metadata);

      // Create interaction record
      const interaction = await Interaction.create({
        userId,
        productId,
        type,
        weight: adjustedWeight,
        metadata
      });

      // Update user profile (async - không block response)
      profileUpdateService.updateUserProfile(userId, productId, type, metadata)
        .catch(error => console.error('Error updating profile:', error));

      res.json({
        success: true,
        message: 'Interaction đã được ghi nhận',
        data: {
          interactionId: interaction.interactionId,
          type,
          weight: adjustedWeight,
          timestamp: interaction.createdAt
        }
      });

    } catch (error) {
      console.error('Error tracking interaction:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi ghi nhận tương tác',
        error: error.message
      });
    }
  }

  /**
   * Track product view
   */
  async trackView(req, res) {
    try {
      const { productId, duration = 0, source = 'direct' } = req.body;
      const userId = req.user.id;
      const sessionId = req.sessionID || `sess_${Date.now()}`;

      const metadata = {
        session_id: sessionId,
        duration: parseInt(duration),
        source
      };

      // Reuse trackInteraction logic
      req.body = { productId, type: 'view', metadata };
      await this.trackInteraction(req, res);

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Lỗi khi ghi nhận lượt xem',
        error: error.message
      });
    }
  }

  /**
   * Create feedback và track interaction
   */
  async createFeedback(req, res) {
    try {
      const { productId, rating, comment, wishlist = false } = req.body;
      const userId = req.user.id;

      // Validate input
      if (!productId || !rating || !comment) {
        return res.status(400).json({
          success: false,
          message: 'productId, rating và comment là bắt buộc'
        });
      }

      // Check if user already gave feedback
      const existingFeedback = await Feedback.findOne({ 
        user_id: userId, 
        product_id: productId 
      });

      if (existingFeedback) {
        return res.status(400).json({
          success: false,
          message: 'Bạn đã đánh giá sản phẩm này rồi'
        });
      }

      // Create feedback
      const feedback = await Feedback.create({ 
        user_id: userId, 
        product_id: productId, 
        rating, 
        comment: comment.trim(), 
        wishlist 
      });

      // Track rating interaction
      const metadata = {
        rating_value: rating,
        source: 'feedback_form'
      };

      await this.trackInteractionInternal(userId, productId, 'rating', metadata);

      // Populate feedback for response
      await feedback.populate('user_id', 'name email');
      await feedback.populate('product_id', 'name images');

      res.status(201).json({
        success: true,
        message: 'Đánh giá đã được tạo thành công',
        data: feedback
      });

    } catch (error) {
      console.error('Error creating feedback:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi tạo đánh giá',
        error: error.message
      });
    }
  }

  /**
   * Add to cart và track interaction
   */
  async addToCart(req, res) {
    try {
      const { productId, quantity = 1 } = req.body;
      const userId = req.user.id;

      // Validate product
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy sản phẩm'
        });
      }

      if (product.stock < quantity) {
        return res.status(400).json({
          success: false,
          message: 'Không đủ hàng trong kho'
        });
      }

      // Find or create cart
      let cart = await Cart.findOne({ user_id: userId });
      if (!cart) {
        cart = await Cart.create({ user_id: userId });
      }

      // Create cart item
      const cartItem = await CartItem.create({ 
        cart_id: cart._id, 
        laptop_id: productId, // Note: using laptop_id as per existing schema
        quantity, 
        price: product.salePrice || product.price 
      });

      // Track add_to_cart interaction
      await this.trackInteractionInternal(userId, productId, 'add_to_cart', {
        quantity,
        price: product.salePrice || product.price,
        source: 'product_page'
      });

      res.status(201).json({
        success: true,
        message: 'Đã thêm vào giỏ hàng',
        data: cartItem
      });

    } catch (error) {
      console.error('Error adding to cart:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi thêm vào giỏ hàng',
        error: error.message
      });
    }
  }

  /**
   * Remove from cart và track interaction
   */
  async removeFromCart(req, res) {
    try {
      const { cartItemId } = req.params;
      const userId = req.user.id;

      // Find cart item
      const cartItem = await CartItem.findById(cartItemId)
        .populate({
          path: 'cart_id',
          match: { user_id: userId }
        });

      if (!cartItem || !cartItem.cart_id) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy item trong giỏ hàng'
        });
      }

      const productId = cartItem.laptop_id;

      // Remove cart item
      await CartItem.findByIdAndDelete(cartItemId);

      // Track remove_from_cart interaction
      await this.trackInteractionInternal(userId, productId, 'remove_from_cart', {
        source: 'cart_page'
      });

      res.json({
        success: true,
        message: 'Đã xóa khỏi giỏ hàng'
      });

    } catch (error) {
      console.error('Error removing from cart:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi xóa khỏi giỏ hàng',
        error: error.message
      });
    }
  }

  /**
   * Create order và track purchase interactions
   */
  async createOrder(req, res) {
    try {
      const { total_amount, shipping_address, payment_method, items } = req.body;
      const userId = req.user.id;

      // Validate input
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Items không được để trống'
        });
      }

      // Create order
      const order = await Order.create({ 
        user_id: userId, 
        total_amount, 
        shipping_address, 
        payment_method 
      });

      // Create order items
      const orderItems = await OrderItem.insertMany(
        items.map(item => ({ 
          order_id: order._id, 
          laptop_id: item.laptop_id, 
          quantity: item.quantity, 
          price: item.price 
        }))
      );

      // Track purchase interactions for each item
      for (const item of items) {
        await this.trackInteractionInternal(userId, item.laptop_id, 'purchase', {
          order_id: order._id.toString(),
          quantity: item.quantity,
          price: item.price,
          source: 'checkout'
        });
      }

      res.status(201).json({
        success: true,
        message: 'Đơn hàng đã được tạo thành công',
        data: { order, orderItems }
      });

    } catch (error) {
      console.error('Error creating order:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi tạo đơn hàng',
        error: error.message
      });
    }
  }

  /**
   * Like/Unlike product
   */
  async toggleLike(req, res) {
    try {
      const { productId } = req.params;
      const userId = req.user.id;

      // Check if already liked
      const existingLike = await Interaction.findOne({
        userId,
        productId,
        type: 'like'
      });

      if (existingLike) {
        // Unlike: remove interaction
        await Interaction.findByIdAndDelete(existingLike._id);
        
        res.json({
          success: true,
          message: 'Đã bỏ thích sản phẩm',
          data: { liked: false }
        });
      } else {
        // Like: create interaction
        await this.trackInteractionInternal(userId, productId, 'like', {
          source: 'product_page'
        });

        res.json({
          success: true,
          message: 'Đã thích sản phẩm',
          data: { liked: true }
        });
      }

    } catch (error) {
      console.error('Error toggling like:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi cập nhật trạng thái thích',
        error: error.message
      });
    }
  }

  /**
   * Get user interactions
   */
  async getUserInteractions(req, res) {
    try {
      const userId = req.user.id;
      const { type, limit = 50, page = 1 } = req.query;

      const filter = { userId };
      if (type) {
        filter.type = type;
      }

      const interactions = await Interaction.find(filter)
        .populate('productId', 'name images price salePrice')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Interaction.countDocuments(filter);

      res.json({
        success: true,
        data: {
          interactions,
          pagination: {
            current: parseInt(page),
            pages: Math.ceil(total / limit),
            total
          }
        }
      });

    } catch (error) {
      console.error('Error getting user interactions:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy lịch sử tương tác',
        error: error.message
      });
    }
  }

  /**
   * Internal method để track interaction (không trả về response)
   */
  async trackInteractionInternal(userId, productId, type, metadata = {}) {
    try {
      const adjustedWeight = profileUpdateService.calculateAdjustedWeight(type, metadata);

      // Create interaction
      const interaction = await Interaction.create({
        userId,
        productId,
        type,
        weight: adjustedWeight,
        metadata
      });

      // Update profile (async)
      profileUpdateService.updateUserProfile(userId, productId, type, metadata)
        .catch(error => console.error('Error updating profile:', error));

      return interaction;

    } catch (error) {
      console.error('Error tracking internal interaction:', error);
      throw error;
    }
  }
}

export default new InteractionController();