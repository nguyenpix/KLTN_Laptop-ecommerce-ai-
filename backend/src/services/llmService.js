import { HfInference } from '@huggingface/inference';
import dotenv from 'dotenv';

dotenv.config();

class LlmService {
  constructor() {
    this.hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

    // Sử dụng Qwen2.5-7B-Instruct - Model free tốt nhất cho tiếng Việt
    this.model = 'Qwen/Qwen2.5-7B-Instruct';

    this.systemPrompt = `Bạn là trợ lý bán hàng laptop thông minh của một cửa hàng thương mại điện tử.

NHIỆM VỤ:
1. Tư vấn và giới thiệu sản phẩm laptop dựa trên thông tin được cung cấp
2. Trả lời câu hỏi về thông số kỹ thuật, giá cả, so sánh sản phẩm
3. Gợi ý sản phẩm phù hợp với nhu cầu và ngân sách khách hàng
4. Giải thích các thuật ngữ kỹ thuật một cách dễ hiểu

QUY TẮC QUAN TRỌNG:
- LUÔN dựa vào THÔNG TIN SẢN PHẨM được cung cấp trong context
- KHÔNG bịa đặt hoặc thêm thông số kỹ thuật không có trong dữ liệu
- KHÔNG đề cập sản phẩm không có trong thông tin được cung cấp
- Trả lời bằng tiếng Việt, ngắn gọn, rõ ràng, dễ hiểu
- Luôn đề cập TÊN SẢN PHẨM và GIÁ CỤ THỂ khi giới thiệu
- Giải thích TẠI SAO gợi ý sản phẩm đó (ưu điểm phù hợp với nhu cầu)
- Sử dụng emoji phù hợp để làm rõ ý (⭐ 💻 🎮 💰 ✅ ❌)
- Nếu không có thông tin đủ để trả lời, hãy thừa nhận và hỏi thêm
- Khi giới thiệu sản phẩm, đề cập rằng khách hàng có thể click vào card sản phẩm bên dưới để xem chi tiết

CÁCH TRẢ LỜI:
- Với câu hỏi chung: Gợi ý 2-3 sản phẩm phù hợp nhất
- Với câu hỏi cụ thể: Trả lời trực tiếp dựa vào thông tin
- Với so sánh: Đưa ra bảng so sánh hoặc phân tích từng điểm
- Cuối mỗi câu trả lời: Hỏi thêm để hiểu rõ nhu cầu
- Luôn nhắc khách "Click vào sản phẩm bên dưới để xem đầy đủ thông tin và đặt hàng"`;
  }

  /**
   * Generate response từ LLM với context từ RAG
   */
  async generateResponse(userMessage, context, conversationHistory = []) {
    const startTime = Date.now();

    try {
      // Build messages
      const messages = this.buildMessages(userMessage, context, conversationHistory);

      console.log('🤖 Generating response with LLM...');

      // Call HuggingFace Inference API
      let fullResponse = '';

      const stream = await this.hf.chatCompletionStream({
        model: this.model,
        messages: messages,
        max_tokens: 800,
        temperature: 0.7,
        top_p: 0.9
      });

      // Collect streamed response
      for await (const chunk of stream) {
        if (chunk.choices && chunk.choices.length > 0) {
          const delta = chunk.choices[0].delta;
          if (delta.content) {
            fullResponse += delta.content;
          }
        }
      }

      const generationTime = Date.now() - startTime;
      console.log(`✅ LLM response generated in ${generationTime}ms`);

      // Estimate tokens (rough approximation)
      const estimatedTokens = Math.ceil(fullResponse.length / 4);

      return {
        content: fullResponse.trim(),
        model: this.model,
        generation_time_ms: generationTime,
        tokens_used: estimatedTokens
      };
    } catch (error) {
      console.error('❌ LLM generation error:', error);

      // Fallback response nếu LLM fail
      return {
        content: this.generateFallbackResponse(context),
        model: 'fallback',
        generation_time_ms: Date.now() - startTime,
        tokens_used: 0,
        error: error.message
      };
    }
  }

  /**
   * Build messages array cho LLM
   */
  buildMessages(userMessage, context, conversationHistory) {
    const messages = [
      {
        role: 'system',
        content: this.systemPrompt
      }
    ];

    // Add conversation history (last 5 messages)
    const recentHistory = conversationHistory.slice(-5);
    recentHistory.forEach((msg) => {
      messages.push({
        role: msg.role,
        content: msg.content
      });
    });

    // Add current user message với context
    messages.push({
      role: 'user',
      content: `${context}\n\n---\n\nCâu hỏi của khách hàng: ${userMessage}`
    });

    return messages;
  }

  /**
   * Generate fallback response khi LLM fail
   */
  generateFallbackResponse(context) {
    if (context.includes('Không tìm thấy')) {
      return 'Xin lỗi, tôi không tìm thấy sản phẩm phù hợp với yêu cầu của bạn. Bạn có thể mô tả chi tiết hơn về nhu cầu sử dụng và ngân sách của mình không?';
    }

    // Extract product info from context (simple parsing)
    const productMatches = context.match(/\[Sản phẩm \d+\] (.+)\nGiá: (.+)/g);

    if (productMatches && productMatches.length > 0) {
      let response = 'Dựa vào yêu cầu của bạn, tôi tìm thấy các sản phẩm sau:\n\n';

      productMatches.forEach((match, idx) => {
        const nameMatch = match.match(/\[Sản phẩm \d+\] (.+)/);
        const priceMatch = match.match(/Giá: (.+)/);

        if (nameMatch && priceMatch) {
          response += `${idx + 1}. ${nameMatch[1]} - ${priceMatch[1]}\n`;
        }
      });

      response += '\nBạn muốn biết thêm thông tin chi tiết về sản phẩm nào?';
      return response;
    }

    return 'Xin lỗi, tôi đang gặp sự cố kỹ thuật. Vui lòng thử lại sau ít phút hoặc liên hệ bộ phận hỗ trợ.';
  }

  /**
   * Validate API key
   */
  validateApiKey() {
    if (!process.env.HUGGINGFACE_API_KEY) {
      throw new Error('HUGGINGFACE_API_KEY is not configured in .env file');
    }
    return true;
  }
}

export default new LlmService();
