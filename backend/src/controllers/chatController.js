import chatbotService from '../services/chatbotService.js';

/**
 * Tạo conversation mới
 */
export const createConversation = async (req, res, next) => {
  try {
    // Cho phép anonymous user (tạo user_id tạm thời)
    const userId = req.user ? req.user._id : null;
    const { title } = req.body;

    const conversation = await chatbotService.createConversation(userId, title);

    res.status(201).json({
      success: true,
      data: conversation
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Lấy danh sách conversations
 */
export const getConversations = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { status = 'active', limit = 20, skip = 0 } = req.query;

    const conversations = await chatbotService.getUserConversations(userId, {
      status,
      limit: parseInt(limit),
      skip: parseInt(skip)
    });

    res.json({
      success: true,
      count: conversations.length,
      data: conversations
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Lấy chi tiết conversation với messages
 */
export const getConversationDetail = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user ? req.user._id : null;

    const result = await chatbotService.getConversationDetail(conversationId, userId);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Gửi message và nhận response từ chatbot
 */
export const sendMessage = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { message } = req.body;
    const userId = req.user ? req.user._id : null;

    // Validate
    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message không được để trống'
      });
    }

    if (message.length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Message quá dài (tối đa 1000 ký tự)'
      });
    }

    // Verify conversation exists (không cần check userId nếu là anonymous)
    const { conversation } = await chatbotService.getConversationDetail(conversationId, userId);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation không tồn tại'
      });
    }

    // Process message với RAG + LLM
    const result = await chatbotService.chat(conversationId, message.trim());

    // Populate referenced products để trả về đầy đủ thông tin
    await result.message.populate('referenced_products.product_id', 'name images price');

    res.json({
      success: true,
      data: {
        message: result.message,
        suggested_products: result.products,
        response_time_ms: result.total_time_ms
      }
    });
  } catch (error) {
    console.error('Send message error:', error);
    next(error);
  }
};

/**
 * Update conversation status
 */
export const updateConversationStatus = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { status } = req.body;
    const userId = req.user._id;

    if (!['active', 'archived', 'closed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status không hợp lệ'
      });
    }

    const conversation = await chatbotService.updateConversationStatus(
      conversationId,
      userId,
      status
    );

    res.json({
      success: true,
      data: conversation
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete conversation
 */
export const deleteConversation = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    const conversation = await chatbotService.deleteConversation(conversationId, userId);

    res.json({
      success: true,
      message: 'Conversation đã được xóa',
      data: conversation
    });
  } catch (error) {
    next(error);
  }
};
