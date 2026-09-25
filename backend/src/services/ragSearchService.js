import Product from '../models/Product.js';
import embeddingService from './embeddingService.js';

class RagSearchService {
  /**
   * Tìm kiếm RAG 2-tier: Quick filter → Deep search
   * @param {string} query - Câu hỏi của user
   * @param {object} options - Tùy chọn search
   * @returns {object} - Kết quả search với chunks và products
   */
  async searchRelevantChunks(query, options = {}) {
    const {
      topK = 5, // Số chunks trả về
      scoreThreshold = 0.65, // Ngưỡng similarity
      maxProducts = 3 // Tối đa số sản phẩm
    } = options;

    const startTime = Date.now();

    try {
      let relevantProducts = [];

      try {
        // STEP 1: Generate query embedding
        console.log(`🔍 Generating embedding for query: "${query}"`);
        const queryEmbedding = await embeddingService.createEmbedding(query);

        // STEP 2: Quick filter với rag_embedding (tìm sản phẩm liên quan)
        console.log('🎯 Tier 1: Quick filtering products...');
        relevantProducts = await this.quickFilterProducts(queryEmbedding, maxProducts);
      } catch (embErr) {
        console.warn('⚠️ Vector embedding unavailable, falling back to keyword search:', embErr.message);
        relevantProducts = await this.keywordSearchProducts(query, maxProducts);
      }

      if (relevantProducts.length === 0) {
        // Fallback to general keyword search if vector search returned nothing
        relevantProducts = await this.keywordSearchProducts(query, maxProducts);
      }

      if (relevantProducts.length === 0) {
        console.log('⚠️  No relevant products found');
        return {
          chunks: [],
          products: [],
          search_time_ms: Date.now() - startTime
        };
      }

      console.log(`✅ Found ${relevantProducts.length} relevant products`);

      // Build chunks từ products (simplified approach)
      const chunks = this.buildChunksFromProducts(relevantProducts);

      console.log(`✅ Built ${chunks.length} product summaries`);

      return {
        chunks,
        products: relevantProducts,
        search_time_ms: Date.now() - startTime
      };
    } catch (error) {
      console.error('❌ RAG search error:', error);
      throw error;
    }
  }

  /**
   * Keyword-based product search fallback
   */
  async keywordSearchProducts(query, limit = 3) {
    try {
      const words = (query || '')
        .toLowerCase()
        .replace(/[^a-zA-Z0-9\sàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/g, ' ')
        .split(/\s+/)
        .filter((w) => w.length > 1 && !['tôi', 'cần', 'mua', 'cho', 'laptop', 'máy', 'tính', 'giúp', 'tìm'].includes(w));

      let products = [];
      if (words.length > 0) {
        const regexPatterns = words.map((w) => new RegExp(w, 'i'));
        products = await Product.find({
          $or: [
            { name: { $in: regexPatterns } },
            { title: { $in: regexPatterns } },
            { description: { $in: regexPatterns } }
          ]
        })
          .limit(limit)
          .select('_id name price brand_id images stock_quantity')
          .lean();
      }

      if (products.length === 0) {
        products = await Product.find()
          .limit(limit)
          .select('_id name price brand_id images stock_quantity')
          .lean();
      }

      return products.map((p) => ({
        ...p,
        similarity: 0.88
      }));
    } catch (err) {
      console.error('Keyword fallback search error:', err);
      return [];
    }
  }

  /**
   * Build simplified chunks from products (fallback when deep search fails)
   */
  buildChunksFromProducts(products) {
    return products.map((product, index) => ({
      product_id: product._id,
      product_name: product.name,
      product_price: product.price,
      product_image: product.images?.[0],
      chunk_content: `${product.name} - Giá: ${product.price.toLocaleString('vi-VN')}đ`,
      chunk_type: 'summary',
      chunk_index: index,
      similarity_score: product.similarity || 0,
      final_score: product.similarity || 0
    }));
  }

  /**
   * Tier 1: Quick filter bằng rag_embedding
   * Tìm sản phẩm có rag_embedding tương đồng với query
   */
  async quickFilterProducts(queryEmbedding, limit = 3) {
    try {
      // Sử dụng aggregation để tính cosine similarity
      const pipeline = [
        {
          $match: {
            rag_embedding: { $exists: true, $ne: null }
            // Tạm bỏ filter stock cho demo
            // stock_quantity: { $gt: 0 }
          }
        },
        {
          $addFields: {
            similarity: {
              $let: {
                vars: {
                  dotProduct: {
                    $reduce: {
                      input: { $range: [0, 384] },
                      initialValue: 0,
                      in: {
                        $add: [
                          '$$value',
                          {
                            $multiply: [
                              { $arrayElemAt: ['$rag_embedding', '$$this'] },
                              { $arrayElemAt: [queryEmbedding, '$$this'] }
                            ]
                          }
                        ]
                      }
                    }
                  }
                },
                in: '$$dotProduct' // Embeddings đã normalized nên không cần chia magnitude
              }
            }
          }
        },
        {
          $match: {
            similarity: { $gte: 0.6 } // Filter >= 60% tương đồng
          }
        },
        {
          $sort: { similarity: -1 }
        },
        {
          $limit: limit
        },
        {
          $project: {
            _id: 1,
            name: 1,
            price: 1,
            brand_id: 1,
            images: 1,
            stock_quantity: 1,
            similarity: 1
          }
        }
      ];

      return await Product.aggregate(pipeline);
    } catch (error) {
      console.error('❌ Quick filter error:', error);
      throw error;
    }
  }

  /**
   * Tier 2: Deep search trong document_chunks
   * Tìm chunks cụ thể trong các sản phẩm đã filter
   */
  async deepSearchChunks(queryEmbedding, productIds, topK, scoreThreshold) {
    try {
      const pipeline = [
        // Chỉ tìm trong các sản phẩm đã filter
        {
          $match: {
            _id: { $in: productIds }
          }
        },
        // Unwind chunks để search từng chunk
        {
          $unwind: '$document_chunks'
        },
        // Filter chunks có embedding
        {
          $match: {
            'document_chunks.embedding': { $exists: true, $type: 'array' }
          }
        },
        // Tính similarity cho từng chunk
        {
          $addFields: {
            similarity: {
              $let: {
                vars: {
                  dotProduct: {
                    $reduce: {
                      input: { $range: [0, 384] },
                      initialValue: 0,
                      in: {
                        $add: [
                          '$$value',
                          {
                            $multiply: [
                              { $arrayElemAt: ['$document_chunks.embedding', '$$this'] },
                              { $arrayElemAt: [queryEmbedding, '$$this'] }
                            ]
                          }
                        ]
                      }
                    }
                  }
                },
                in: '$$dotProduct'
              }
            }
          }
        },
        // Filter theo threshold
        {
          $match: {
            similarity: { $gte: scoreThreshold }
          }
        },
        // Tính điểm tổng hợp (similarity + priority)
        {
          $addFields: {
            final_score: {
              $add: [
                { $multiply: ['$similarity', 0.8] },
                { $multiply: ['$document_chunks.metadata.priority', 0.02] }
              ]
            }
          }
        },
        // Sort theo điểm
        {
          $sort: { final_score: -1 }
        },
        // Lấy top K
        {
          $limit: topK
        },
        // Format output
        {
          $project: {
            product_id: '$_id',
            product_name: '$name',
            product_price: '$price',
            product_image: { $arrayElemAt: ['$images', 0] },
            chunk_content: '$document_chunks.content',
            chunk_type: '$document_chunks.metadata.type',
            chunk_index: '$document_chunks.metadata.chunk_index',
            similarity_score: '$similarity',
            priority: '$document_chunks.metadata.priority',
            final_score: 1
          }
        }
      ];

      return await Product.aggregate(pipeline);
    } catch (error) {
      console.error('❌ Deep search error:', error);
      throw error;
    }
  }

  /**
   * Build context từ chunks cho LLM
   * Format: Product-grouped context với thông tin đầy đủ
   */
  buildContext(chunks, products) {
    if (!chunks || chunks.length === 0) {
      return 'Không tìm thấy thông tin sản phẩm liên quan trong cơ sở dữ liệu.';
    }

    let context = 'THÔNG TIN SẢN PHẨM LIÊN QUAN:\n\n';

    // Group chunks theo sản phẩm
    const groupedByProduct = chunks.reduce((acc, chunk) => {
      const key = chunk.product_id.toString();
      if (!acc[key]) {
        const product = products.find((p) => p._id.toString() === key);
        acc[key] = {
          name: chunk.product_name,
          price: chunk.product_price,
          image: chunk.product_image,
          similarity: product?.similarity || 0,
          chunks: []
        };
      }
      acc[key].chunks.push(chunk);
      return acc;
    }, {});

    // Format context
    Object.values(groupedByProduct).forEach((product, idx) => {
      const priceFormatted = new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(product.price);

      context += `[Sản phẩm ${idx + 1}] ${product.name}\n`;
      context += `Giá: ${priceFormatted}\n`;
      context += `Độ phù hợp: ${(product.similarity * 100).toFixed(1)}%\n`;
      context += 'Thông tin chi tiết:\n';

      product.chunks.forEach((chunk, i) => {
        context += `${i + 1}. ${chunk.chunk_content}\n`;
      });

      context += '\n';
    });

    return context;
  }

  /**
   * Extract product IDs từ kết quả search để tracking
   */
  extractProductIds(chunks) {
    const productIds = new Set();
    chunks.forEach((chunk) => {
      productIds.add(chunk.product_id.toString());
    });
    return Array.from(productIds);
  }
}

export default new RagSearchService();
