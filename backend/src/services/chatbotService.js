import ragSearchService from './ragSearchService.js';
import llmService from './llmService.js';
import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';

class ChatbotService {
  /**
   * Xử lý câu hỏi của user với RAG + LLM
   */
  async chat(conversationId, userMessage) {
    const startTime = Date.now();

    try {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`💬 Processing message in conversation: ${conversationId}`);
      console.log(`📝 User: "${userMessage}"`);
      console.log('='.repeat(60));

      // STEP 1: Lưu user message
      await Message.create({
        conversation_id: conversationId,
        role: 'user',
        content: userMessage
      });

      // STEP 2: RAG Search - tìm thông tin liên quan
      const ragResults = await ragSearchService.searchRelevantChunks(userMessage, {
        topK: 5,
        scoreThreshold: 0.65,
        maxProducts: 3
      });

      // STEP 3: Build context từ chunks
      const context = ragSearchService.buildContext(ragResults.chunks, ragResults.products);

      // STEP 4: Lấy lịch sử hội thoại (5 tin nhắn gần nhất)
      const conversationHistory = await this.getConversationHistory(conversationId, 5);

      // STEP 5: Generate answer với LLM
      const llmResponse = await llmService.generateResponse(
        userMessage,
        context,
        conversationHistory
      );

      // STEP 6: Lưu assistant message
      const assistantMessage = await Message.create({
        conversation_id: conversationId,
        role: 'assistant',
        content: llmResponse.content,
        referenced_products: ragResults.products.map((p) => ({
          product_id: p._id,
          relevance_score: p.similarity || 0,
          chunks_used: ragResults.chunks
            .filter((c) => c.product_id.toString() === p._id.toString())
            .map((c) => c.chunk_index)
        })),
        metadata: {
          rag_results: {
            total_chunks: ragResults.chunks.length,
            top_scores: ragResults.chunks.map((c) => c.final_score),
            search_time_ms: ragResults.search_time_ms
          },
          llm_metadata: {
            model: llmResponse.model,
            tokens_used: llmResponse.tokens_used,
            generation_time_ms: llmResponse.generation_time_ms
          }
        }
      });

      // STEP 7: Update conversation
      await this.updateConversation(conversationId, ragResults, userMessage);

      const totalTime = Date.now() - startTime;

      console.log(`\n✅ Response generated successfully in ${totalTime}ms`);
      console.log(`   - RAG search: ${ragResults.search_time_ms}ms`);
      console.log(`   - LLM generation: ${llmResponse.generation_time_ms}ms`);
      console.log(`   - Products found: ${ragResults.products.length}`);
      console.log(`   - Chunks used: ${ragResults.chunks.length}`);
      console.log('='.repeat(60) + '\n');

      return {
        message: assistantMessage,
        products: ragResults.products,
        total_time_ms: totalTime
      };
    } catch (error) {
      console.error('❌ Chatbot service error:', error);
      throw error;
    }
  }

  /**
   * Lấy lịch sử hội thoại
   */
  async getConversationHistory(conversationId, limit = 5) {
    const messages = await Message.find({ conversation_id: conversationId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('role content');

    return messages.reverse().map((m) => ({
      role: m.role,
      content: m.content
    }));
  }

  /**
   * Update conversation với context mới
   */
  async updateConversation(conversationId, ragResults, userMessage) {
    const updateData = {
      last_message_at: new Date()
    };

    // Thêm interested products
    if (ragResults.products && ragResults.products.length > 0) {
      const productIds = ragResults.products.map((p) => ({
        product_id: p._id,
        mention_count: 1
      }));

      await Conversation.findByIdAndUpdate(conversationId, {
        ...updateData,
        $addToSet: {
          'context_summary.interested_products': { $each: productIds }
        }
      });
    } else {
      await Conversation.findByIdAndUpdate(conversationId, updateData);
    }
  }

  /**
   * Tạo conversation mới
   */
  async createConversation(userId, title = null) {
    const conversation = await Conversation.create({
      user_id: userId,
      title: title || 'Hội thoại mới',
      status: 'active'
    });

    console.log(`✅ Created new conversation: ${conversation._id}`);
    return conversation;
  }

  /**
   * Lấy danh sách conversations của user
   */
  async getUserConversations(userId, options = {}) {
    const { status = 'active', limit = 20, skip = 0 } = options;

    const conversations = await Conversation.find({
      user_id: userId,
      status
    })
      .sort({ last_message_at: -1 })
      .skip(skip)
      .limit(limit)
      .populate('context_summary.interested_products.product_id', 'name images price');

    // Thêm message count và last message cho mỗi conversation
    const conversationsWithDetails = await Promise.all(
      conversations.map(async (conv) => {
        const messageCount = await Message.countDocuments({ conversation_id: conv._id });
        const lastMessage = await Message.findOne({ conversation_id: conv._id })
          .sort({ createdAt: -1 })
          .select('content createdAt role');

        return {
          ...conv.toObject(),
          message_count: messageCount,
          last_message: lastMessage
        };
      })
    );

    return conversationsWithDetails;
  }

  /**
   * Lấy chi tiết conversation với messages
   */
  async getConversationDetail(conversationId, userId) {
    // Nếu userId = null (anonymous), chỉ tìm theo conversationId
    const query = userId 
      ? { _id: conversationId, user_id: userId }
      : { _id: conversationId };

    const conversation = await Conversation.findOne(query)
      .populate('context_summary.interested_products.product_id', 'name images price');

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    const messages = await Message.find({ conversation_id: conversationId })
      .sort({ createdAt: 1 })
      .populate('referenced_products.product_id', 'name images price');

    return {
      conversation,
      messages
    };
  }

  /**
   * Đóng hoặc archive conversation
   */
  async updateConversationStatus(conversationId, userId, status) {
    const conversation = await Conversation.findOneAndUpdate(
      { _id: conversationId, user_id: userId },
      { status },
      { new: true }
    );

    if (!conversation) {
      throw new Error('Conversation not found or access denied');
    }

    return conversation;
  }

  /**
   * Xóa conversation (soft delete)
   */
  async deleteConversation(conversationId, userId) {
    return await this.updateConversationStatus(conversationId, userId, 'archived');
  }
}

export default new ChatbotService();
