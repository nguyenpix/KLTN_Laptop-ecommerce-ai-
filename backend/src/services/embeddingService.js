import { HfInference } from '@huggingface/inference';
import dotenv from 'dotenv';

dotenv.config();

/**
 * EMBEDDING SERVICE - HuggingFace Integration
 * Sử dụng HuggingFace Inference API để tạo embeddings
 */

class EmbeddingService {
  constructor() {
    if (!process.env.HUGGINGFACE_API_KEY) {
      throw new Error('HUGGINGFACE_API_KEY is not set in .env file');
    }

    this.hf = new HfInference(process.env.HUGGINGFACE_API_KEY);
    
    this.model = 'sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2';
    this.dimensions = 384;
    
    // Rate limiting
    this.requestDelay = 200; // ms giữa các requests (5 req/s)
    this.lastRequestTime = 0;
  }

  /**
   * Delay để tránh rate limit
   */
  async _rateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.requestDelay) {
      const waitTime = this.requestDelay - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequestTime = Date.now();
  }

  /**
   * Tạo embedding cho 1 đoạn text
   * @param {string} text - Text cần tạo embedding
   * @returns {Promise<number[]>} - Array of 384 numbers
   */
  async createEmbedding(text) {
    if (!text || text.trim().length === 0) {
      throw new Error('Text cannot be empty');
    }

    try {
      await this._rateLimit();

      // Truncate text nếu quá dài (max 512 tokens ≈ 2000 chars)
      const maxLength = 2000;
      const truncatedText = text.length > maxLength 
        ? text.substring(0, maxLength) + '...'
        : text;

      const response = await this.hf.featureExtraction({
        model: this.model,
        inputs: truncatedText
      });

      // Response có thể là array hoặc nested array
      const embedding = Array.isArray(response[0]) ? response[0] : response;

      // Validate dimensions
      if (embedding.length !== this.dimensions) {
        throw new Error(`Expected ${this.dimensions} dimensions, got ${embedding.length}`);
      }

      return embedding;

    } catch (error) {
      console.error(' Embedding error:', error.message);
      
      // Retry logic cho rate limit errors
      if (error.message.includes('rate limit') || error.message.includes('429')) {
        console.log('⏳ Rate limited, waiting 5 seconds...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        return this.createEmbedding(text); // Retry
      }
      
      throw error;
    }
  }

  /**
   * Tạo embeddings cho nhiều texts (batch)
   * @param {string[]} texts - Array of texts
   * @returns {Promise<number[][]>} - Array of embeddings
   */
  async createBatchEmbeddings(texts, onProgress = null) {
    if (!Array.isArray(texts) || texts.length === 0) {
      throw new Error('Texts must be a non-empty array');
    }

    const embeddings = [];
    
    for (let i = 0; i < texts.length; i++) {
      try {
        const embedding = await this.createEmbedding(texts[i]);
        embeddings.push(embedding);

        if (onProgress) {
          onProgress(i + 1, texts.length);
        }
      } catch (error) {
        console.error(` Failed to create embedding for text ${i + 1}:`, error.message);
        embeddings.push(null); // Push null để maintain index
      }
    }

    return embeddings;
  }

  /**
   * Test connection với HuggingFace API
   * @returns {Promise<boolean>}
   */
  async testConnection() {
    try {
      console.log('🔍 Testing HuggingFace API connection...');
      
      const testText = 'Đây là một test để kiểm tra kết nối HuggingFace API.';
      const embedding = await this.createEmbedding(testText);
      
      console.log(' Connection successful!');
      console.log(`📊 Model: ${this.model}`);
      console.log(`📏 Dimensions: ${embedding.length}`);
      console.log(`📈 Sample: [${embedding.slice(0, 5).map(v => v.toFixed(4)).join(', ')}...]`);
      
      return true;
    } catch (error) {
      console.error(' Connection failed:', error.message);
      return false;
    }
  }

  /**
   * Get model info
   */
  getModelInfo() {
    return {
      model: this.model,
      dimensions: this.dimensions,
      provider: 'HuggingFace',
      supports_vietnamese: true
    };
  }
}

// Export singleton instance
export default new EmbeddingService();
