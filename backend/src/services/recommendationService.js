import mongoose from 'mongoose';
import UserRecommendationProfile from '../models/UserProfile.js';
import Interaction from '../models/Interaction.js';
import Product from '../models/Product.js';
import profileUpdateService from './profileUpdateService.js';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * RECOMMENDATION SERVICE - HỆ THỐNG ĐỀ XUẤT SẢN PHẨM HYBRID
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Kết hợp 3 phương pháp:
 * 1. Content-Based Filtering (Lọc dựa trên nội dung) - 70%
 * 2. Collaborative Filtering (Lọc cộng tác) - 30%
 * 3. Popularity (Độ phổ biến) - Fallback
 * 
 * Công nghệ:
 * - MongoDB Atlas Vector Search (tìm kiếm vector nhanh)
 * - Sentence Transformers Embeddings (384 dimensions)
 * - Cosine Similarity (độ tương đồng cosine)
 * - Item-Item Collaborative Filtering (lọc cộng tác item-item)
 * 
 * @author Your Team
 * @version 2.1 - Hybrid with Vector Search, Content-Based priority
 * ═══════════════════════════════════════════════════════════════════════════════
 */

class RecommendationService {
  constructor() {
    // Cache để lưu trữ độ tương đồng giữa các sản phẩm (tránh tính toán lại nhiều lần)
    this.itemSimilarityCache = new Map();
    
    // Bật/tắt tính năng Vector Search (nếu tắt sẽ sử dụng tính toán thủ công)
    this.useVectorSearch = true;
  }

  /**
   * ═══════════════════════════════════════════════════════════════════════════
   * HÀM CHÍNH: LẤY DANH SÁCH RECOMMENDATIONS CHO USER
   * ═══════════════════════════════════════════════════════════════════════════
   * 
   * FLOW HOẠT ĐỘNG:
   * 
   * Step 1: Ensure Profile (Đảm bảo user có profile)
   *   - Kiểm tra user đã có profile chưa
   *   - Nếu chưa → Tạo default profile (LAZY INITIALIZATION)
   * 
   * Step 2: Content-Based Filtering (Lọc dựa nội dung - 70% weight)
   *   - Build user embedding (vector 384 dims đại diện sở thích user)
   *   - Dùng Vector Search tìm 50 sản phẩm gần nhất
   *   - Fallback: Manual calculation nếu Vector Search lỗi
   * 
   * Step 3: Collaborative Filtering (Lọc cộng tác - 30% weight)
   *   - Tính similarity giữa candidates và products user đã tương tác
   *   - Kết hợp điểm: final = 0.7*content + 0.3*collaborative
   * 
   * Step 4: Exclude Interacted (Loại bỏ đã xem/mua)
   *   - Filter ra những sản phẩm user đã tương tác
   * 
   * Step 5: Add Diversity (Thêm đa dạng)
   *   - Giới hạn mỗi brand tối đa 3 sản phẩm
   *   - Tránh recommend toàn 1 brand
   * 
   * @param {String} userId - ID của user cần recommendations
   * @param {Object} options - Tùy chọn
   * @param {Number} options.candidateLimit - Số lượng candidates (default: 50)
   * @param {Number} options.finalLimit - Số lượng kết quả cuối (default: 10)
   * @param {Boolean} options.excludeInteracted - Loại bỏ đã tương tác (default: true)
   * 
   * @returns {Array} Danh sách recommendations với scores
   * 
   * VÍ DỤ RETURN:
   * [
   *   {
   *     productId: "abc123",
   *     product: { name: "Dell XPS 13", price: 30000000, ... },
   *     content_score: 0.85,        // Điểm content-based
   *     collaborative_score: 0.72,  // Điểm collaborative
   *     final_score: 0.759          // = 0.7*0.85 + 0.3*0.72
   *   },
   *   ...
   * ]
   * ═══════════════════════════════════════════════════════════════════════════
   */
  async getRecommendations(userId, options = {}) {
    const {
      candidateLimit = 50,
      finalLimit = 10,
      excludeInteracted = true
    } = options;

    try {
      console.log(`🎯 Đang tạo gợi ý cho người dùng ${userId}`);

      // 🚀 GIAI ĐOẠN KHỞI TẠO LƯỜI: Kiểm tra và tạo hồ sơ nếu cần
      await this.ensureUserProfile(userId);

      // Bước 1: Lọc dựa trên nội dung (tạo các ứng viên)
      const candidates = await this.getContentBasedCandidates(userId, candidateLimit);

      if (candidates.length === 0) {
        console.log('Không tìm thấy ứng viên nào, trả về mảng rỗng');
        return [];
      }

      // Bước 2: Lọc cộng tác (tinh chỉnh xếp hạng)
      let recommendations = await this.applyCollaborativeFiltering(
        candidates, 
        userId, 
        finalLimit
      );

      // Bước 3: Loại trừ các mục đã tương tác
      if (excludeInteracted) {
        recommendations = await this.excludeInteractedItems(recommendations, userId);
      }


      console.log(` Đã tạo ${recommendations.length} gợi ý cuối cùng`);
      return recommendations;

    } catch (error) {
      console.error(' Lỗi trong quá trình tạo gợi ý:', error);
      throw error;
    }
  }

  /**
   * Đảm bảo người dùng có hồ sơ gợi ý (tạo mặc định nếu chưa có).
   * @param {String} userId - ID của người dùng.
   */
  async ensureUserProfile(userId) {
    try {
      // 1️⃣ Kiểm tra xem người dùng đã có hồ sơ chưa
      let userProfile = await UserRecommendationProfile.findOne({ userId });

      // 2️⃣ Nếu chưa có hoặc chưa có embedding → Tạo mặc định
      if (!userProfile || !userProfile.user_embedding) {
        console.log(`⚠️ Người dùng ${userId} chưa có hồ sơ hoặc embedding, đang tạo mặc định...`);
        
        // Gọi profileUpdateService để tạo hồ sơ mặc định
        userProfile = await profileUpdateService.createDefaultUserProfile(userId);
        
        if (userProfile) {
          console.log(` Đã tạo hồ sơ mặc định cho người dùng ${userId}`);
          console.log(`   - Quality: ${userProfile.embedding_metadata?.quality}`);
          console.log(`   - Source: ${userProfile.embedding_metadata?.source}`);
        } else {
          console.log(`⚠️ Không thể tạo hồ sơ mặc định, sẽ sử dụng gợi ý khởi động nguội`);
        }
      }

      return userProfile;

    } catch (error) {
      console.error(' Lỗi khi đảm bảo hồ sơ người dùng:', error);
      return null;
    }
  }

  /**
   * BƯỚC 1: LỌC DỰA TRÊN NỘI DUNG (CONTENT-BASED FILTERING)
   * Tạo tập hợp ứng viên dựa trên sở thích của người dùng với embeddings.
   */
  async getContentBasedCandidates(userId, limit = 50) {
    try {
      // 1. Lấy hồ sơ người dùng đã chuẩn hóa
      const userProfile = await profileUpdateService.getNormalizedProfile(userId);
      
      if (!userProfile) {
        console.log(`Không có hồ sơ cho người dùng ${userId}, sử dụng gợi ý khởi động nguội`);
        return await this.getColdStartRecommendations(limit);
      }

      // 3. Xây dựng embedding sở thích người dùng từ hồ sơ
      const userEmbedding = await this.buildUserEmbeddingFromProfile(userProfile, null);

      // 4. Sử dụng Vector Search nếu được bật và có sẵn
      let candidates;
      
      if (this.useVectorSearch && userEmbedding) {
        try {
          candidates = await this.getContentBasedCandidatesVectorSearch(userEmbedding, limit);
          if (candidates && candidates.length > 0) {
            console.log(` Content-based (Vector Search): ${candidates.length} candidates`);
            return candidates;
          }
          console.log('⚠️ Vector Search trả về 0 kết quả (có thể do môi trường Local/chưa có Atlas Search Index), chuyển sang tính cosine similarity thủ công...');
        } catch (error) {
          console.log('⚠️ Vector Search thất bại, đang chuyển sang tính toán thủ công:', error.message);
          // Dự phòng: Chuyển sang tính toán thủ công bên dưới
        }
      }

      // 2. Dự phòng: Lấy tất cả sản phẩm đang hoạt động có embeddings (chỉ khi Vector Search thất bại)
      const allProducts = await Product.find({ 
        stock: { $gt: 0 },
        embedding: { $exists: true, $ne: null }
      })
      .populate('brand_id', 'name')
      .populate('category_id', 'name')
      .select('name price images specifications brand_id category_id embedding');

      if (allProducts.length === 0) {
        console.log('⚠️ Không tìm thấy sản phẩm nào có embedding');
        return [];
      }

      // 5. Tính toán thủ công (dự phòng hoặc nếu Vector Search bị tắt)
      candidates = [];
      
      for (const product of allProducts) {
        // Sử dụng embedding có sẵn thay vì xây dựng vector mới
        const contentScore = this.cosineSimilarity(userEmbedding, product.embedding);

        candidates.push({
          productId: product._id,
          // Chỉ giữ lại info cơ bản, không trả toàn bộ product object
          name: product.name,
          price: product.price,
          image: product.images?.mainImg?.url,
          brand: product.brand_id?.name,
          content_score: contentScore
        });
      }

      // 6. Sắp xếp và lấy các ứng viên hàng đầu
      candidates.sort((a, b) => b.content_score - a.content_score);
      
      console.log(` Content-based (embeddings): ${Math.min(limit, candidates.length)} ứng viên`);
      return candidates.slice(0, limit);

    } catch (error) {
      console.error(' Lỗi khi lấy ứng viên dựa trên nội dung:', error);
      throw error;
    }
  }

  /**
   * LỌC DỰA TRÊN NỘI DUNG với MongoDB Atlas Vector Search (NHANH!)
   * Sử dụng $vectorSearch thay vì lặp qua tất cả sản phẩm.
   */
  async getContentBasedCandidatesVectorSearch(userEmbedding, limit = 50) {
    try {
      console.log(`🔍 Tìm kiếm Vector: userEmbedding dims=${userEmbedding?.length}, giới hạn=${limit}`);
      
      const results = await Product.aggregate([
        {
          $vectorSearch: {
            index: "vector_index",
            path: "embedding",
            queryVector: userEmbedding,
            numCandidates: Math.min(limit * 4, 200), // Tìm kiếm trong top 200 ứng viên
            limit: limit
          }
        },
        {
          $addFields: {
            content_score: { $meta: "vectorSearchScore" }
          }
        },
        {
          $match: {
            stock: { $gt: 0 }
          }
        },
        {
          $lookup: {
            from: 'brands',
            localField: 'brand_id',
            foreignField: '_id',
            as: 'brand_id'
          }
        },
        {
          $lookup: {
            from: 'categories',
            localField: 'category_id',
            foreignField: '_id',
            as: 'category_id'
          }
        },
        {
          $unwind: {
            path: '$brand_id',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $addFields: {
            content_score: { $meta: "vectorSearchScore" }
          }
        },
        {
          $project: {
            name: 1,
            price: 1,
            images: 1,
            specifications: 1,
            brand_id: { _id: 1, name: 1 },
            category_id: { _id: 1, name: 1 },
            content_score: 1
          }
        }
      ]);

      console.log(`🔍 Tìm kiếm Vector trả về ${results.length} kết quả`);

      return results.map(product => ({
        productId: product._id,
        // Chỉ giữ lại info cơ bản
        name: product.name,
        price: product.price,
        image: product.images?.mainImg?.url,
        brand: product.brand_id?.name,
        content_score: product.content_score
      }));

    } catch (error) {
            console.error(' Lỗi tìm kiếm Vector:', error.message);      throw error;
    }
  }

  /**
   * Xây dựng embedding người dùng từ hồ sơ đã chuẩn hóa.
   * Tạo trung bình có trọng số của các embeddings từ sản phẩm người dùng thích.
   */
  async buildUserEmbeddingFromProfile(userProfile, allProducts = null) {
    try {
      // TÙY CHỌN 1: Nếu người dùng đã có embedding sẵn → sử dụng ngay
      const savedProfile = await UserRecommendationProfile.findOne({ 
        userId: userProfile.userId 
      });

      if (savedProfile && savedProfile.user_embedding && savedProfile.user_embedding.length === 384) {
        console.log(` Đang sử dụng embedding người dùng đã lưu (chất lượng: ${savedProfile.embedding_metadata?.quality})`);
        return savedProfile.user_embedding;
      }

      // TÙY CHỌN 2: Nếu chưa có embedding → cần tải sản phẩm để tạo
      if (!allProducts) {
        console.log('🔄 Đang tải sản phẩm để xây dựng embedding người dùng từ sở thích...');
        allProducts = await Product.find({ 
          stock: { $gt: 0 },
          embedding: { $exists: true, $ne: null }
        })
        .populate('brand_id', 'name')
        .populate('category_id', 'name')
        .select('name price brand_id category_id embedding')
        .limit(100); // Giới hạn 100 sản phẩm để cải thiện hiệu suất
      }

      if (!allProducts || allProducts.length === 0) {
        console.log('⚠️ Không có sản phẩm nào để xây dựng embedding');
        return null;
      }

      console.log(`🔄 Đang xây dựng embedding người dùng từ ${allProducts.length} sản phẩm có sẵn...`);

      // Khởi tạo vector embedding người dùng (384 chiều)
      const userEmbedding = new Array(384).fill(0);
      let totalWeight = 0;

      // Lấy các thương hiệu và danh mục hàng đầu mà người dùng ưu tiên
      const topBrands = Object.entries(userProfile.brands || {})
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([name]) => name);

      const topCategories = Object.entries(userProfile.categories || {})
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(([name]) => name);

      // Tìm các sản phẩm phù hợp với sở thích của người dùng
      const preferredProducts = allProducts.filter(product => {
        const brandMatch = topBrands.includes(product.brand_id?.name);
        const categoryMatch = product.category_id?.some(cat => 
          topCategories.includes(cat?.name)
        );
        return brandMatch || categoryMatch;
      });

      if (preferredProducts.length === 0) {
        console.log('⚠️ Không tìm thấy sản phẩm ưu tiên, đang sử dụng trung bình của tất cả sản phẩm');
        // Dự phòng: trung bình của tất cả sản phẩm
        for (const product of allProducts.slice(0, 20)) {
          for (let i = 0; i < 384; i++) {
            userEmbedding[i] += product.embedding[i];
          }
        }
        return this.normalizeVector(userEmbedding.map(v => v / Math.min(20, allProducts.length)));
      }

      // Trung bình có trọng số của các sản phẩm ưu tiên
      for (const product of preferredProducts) {
        const brand = product.brand_id?.name;
        const brandWeight = userProfile.brands?.[brand] || 0;
        
        // Tính trọng số cho sản phẩm này
        const weight = Math.max(brandWeight, 0.1); // Trọng số tối thiểu 0.1
        
        // Cộng embedding có trọng số
        for (let i = 0; i < 384; i++) {
          userEmbedding[i] += product.embedding[i] * weight;
        }
        totalWeight += weight;
      }

      // Chuẩn hóa
      if (totalWeight > 0) {
        for (let i = 0; i < 384; i++) {
          userEmbedding[i] /= totalWeight;
        }
      }

      console.log(` Đã xây dựng embedding người dùng từ ${preferredProducts.length} sản phẩm ưu tiên`);
      return this.normalizeVector(userEmbedding);

    } catch (error) {
      console.error(' Lỗi khi xây dựng embedding người dùng:', error);
      // Fallback: return zero vector
      return new Array(384).fill(0);
    }
  }

  /**
   * Xây dựng vector người dùng từ hồ sơ đã chuẩn hóa (PHƯƠNG PHÁP CŨ - GIỮ LẠI ĐỂ TƯƠNG THÍCH NGƯỢC).
   */
  buildUserVectorFromProfile(userProfile) {
    const vector = [];

    const topBrands = ['Dell', 'HP', 'Lenovo', 'Asus', 'Acer', 'MSI', 'Apple', 'Samsung', 'LG', 'Razer'];
    const topCategories = ['laptop', 'desktop', 'monitor', 'accessory'];
    const cpuSpecs = ['Intel Core i3', 'Intel Core i5', 'Intel Core i7', 'Intel Core i9', 'AMD Ryzen 3', 'AMD Ryzen 5', 'AMD Ryzen 7', 'AMD Ryzen 9'];
    const gpuSpecs = ['Intel UHD', 'Intel Iris', 'RTX 3050', 'RTX 3060', 'RTX 3070', 'RTX 4050', 'RTX 4060', 'RTX 4070', 'GTX 1650', 'AMD Radeon'];
    const ramSpecs = ['4GB', '8GB', '16GB', '32GB', '64GB'];

    // Thương hiệu (vị trí 0-9)
    topBrands.forEach(brand => vector.push(userProfile.brands?.[brand] || 0));

    // Danh mục (vị trí 10-13)
    topCategories.forEach(cat => vector.push(userProfile.categories?.[cat] || 0));

    // Thông số CPU (vị trí 14-21)
    cpuSpecs.forEach(cpu => vector.push(userProfile.cpu_specs?.[cpu] || 0));

    // Thông số GPU (vị trí 22-31)
    gpuSpecs.forEach(gpu => vector.push(userProfile.gpu_specs?.[gpu] || 0));

    // Thông số RAM (vị trí 32-36)
    ramSpecs.forEach(ram => vector.push(userProfile.ram_specs?.[ram] || 0));

    return this.normalizeVector(vector);
  }

  /**
   * Xây dựng vector sản phẩm.
   */
  buildProductVector(product) {
    const vector = new Array(37).fill(0);

    const topBrands = ['Dell', 'HP', 'Lenovo', 'Asus', 'Acer', 'MSI', 'Apple', 'Samsung', 'LG', 'Razer'];
    const topCategories = ['laptop', 'desktop', 'monitor', 'accessory'];

    // Thương hiệu
    const brandIndex = topBrands.indexOf(product.brand_id?.name);
    if (brandIndex !== -1) vector[brandIndex] = 1;

    // Danh mục
    if (product.category_id && Array.isArray(product.category_id)) {
      product.category_id.forEach(cat => {
        const catIndex = topCategories.indexOf(cat?.name);
        if (catIndex !== -1) vector[10 + catIndex] = 1;
      });
    }

    // CPU
    if (product.specifications?.cpu) {
      const cpu = product.specifications.cpu;
      const cpuSpecs = ['Intel Core i3', 'Intel Core i5', 'Intel Core i7', 'Intel Core i9', 'AMD Ryzen 3', 'AMD Ryzen 5', 'AMD Ryzen 7', 'AMD Ryzen 9'];
      cpuSpecs.forEach((spec, idx) => {
        if (cpu.includes(spec)) vector[14 + idx] = 1;
      });
    }

    // GPU (Bộ xử lý đồ họa)
    if (product.specifications?.gpu) {
      const gpu = product.specifications.gpu;
      const gpuSpecs = ['Intel UHD', 'Intel Iris', 'RTX 3050', 'RTX 3060', 'RTX 3070', 'RTX 4050', 'RTX 4060', 'RTX 4070', 'GTX 1650', 'AMD Radeon'];
      gpuSpecs.forEach((spec, idx) => {
        if (gpu.includes(spec)) vector[22 + idx] = 1;
      });
    }

    // RAM
    if (product.specifications?.ram) {
      const ram = product.specifications.ram;
      const ramSpecs = ['4GB', '8GB', '16GB', '32GB', '64GB'];
      ramSpecs.forEach((spec, idx) => {
        if (ram.includes(spec)) vector[32 + idx] = 1;
      });
    }

    return vector;
  }

  /**
   * BƯỚC 2: LỌC CỘNG TÁC (COLLABORATIVE FILTERING)
   */
  async applyCollaborativeFiltering(candidates, userId, finalLimit = 10) {
    try {
      const userInteractions = await Interaction.find({ userId })
        .select('productId type weight');

      if (userInteractions.length === 0) {
        console.log('Không có tương tác, đang sử dụng xếp hạng theo độ phổ biến');
        return this.applyPopularityRanking(candidates, finalLimit);
      }

      // Tối ưu hóa: Preload batch embeddings của tất cả candidate và interacted products
      const productIdsToLoad = new Set([
        ...candidates.map(c => c.productId.toString()),
        ...userInteractions.map(i => i.productId.toString())
      ]);

      const loadedProducts = await Product.find({
        _id: { $in: Array.from(productIdsToLoad) }
      }).select('_id embedding').lean();

      const embeddingMap = new Map();
      loadedProducts.forEach(p => {
        if (p.embedding && Array.isArray(p.embedding)) {
          embeddingMap.set(p._id.toString(), p.embedding);
        }
      });

      const rankedCandidates = [];

      for (const candidate of candidates) {
        let totalScore = 0;
        let totalWeight = 0;
        const targetEmb = embeddingMap.get(candidate.productId.toString());

        for (const interaction of userInteractions) {
          const interEmb = embeddingMap.get(interaction.productId.toString());
          let similarity = 0;

          if (candidate.productId.toString() === interaction.productId.toString()) {
            similarity = 1.0;
          } else if (targetEmb && interEmb) {
            similarity = this.cosineSimilarity(targetEmb, interEmb);
          }

          if (similarity > 0.1) {
            const implicitRating = interaction.weight;
            totalScore += similarity * implicitRating;
            totalWeight += similarity;
          }
        }

        const collaborativeScore = totalWeight > 0 ? totalScore / totalWeight : 0;
        const finalScore = (candidate.content_score * 0.7) + (collaborativeScore * 0.3);

        rankedCandidates.push({
          ...candidate,
          collaborative_score: collaborativeScore,
          final_score: finalScore
        });
      }

      rankedCandidates.sort((a, b) => b.final_score - a.final_score);
      
      return rankedCandidates.slice(0, finalLimit);

    } catch (error) {
      console.error(' Lỗi khi áp dụng lọc cộng tác:', error);
      throw error;
    }
  }

  async calculateCollaborativeScore(targetProductId, userInteractions) {
    try {
      let totalScore = 0;
      let totalWeight = 0;

      for (const interaction of userInteractions) {
        const similarity = await this.getItemSimilarity(
          targetProductId,
          interaction.productId
        );

        if (similarity > 0.1) {
          const implicitRating = interaction.weight;
          totalScore += similarity * implicitRating;
          totalWeight += similarity;
        }
      }

      return totalWeight > 0 ? totalScore / totalWeight : 0;

    } catch (error) {
      console.error(' Lỗi khi tính điểm cộng tác:', error);
      return 0;
    }
  }

  async getItemSimilarity(productId1, productId2) {
    if (productId1.toString() === productId2.toString()) return 1.0;

    const key = `${productId1}_${productId2}`;
    const reverseKey = `${productId2}_${productId1}`;

    if (this.itemSimilarityCache.has(key)) return this.itemSimilarityCache.get(key);
    if (this.itemSimilarityCache.has(reverseKey)) return this.itemSimilarityCache.get(reverseKey);

    try {
      // Sử dụng embeddings để tính độ tương đồng (NHANH HƠN)
      const [product1, product2] = await Promise.all([
        Product.findById(productId1).select('embedding').lean(),
        Product.findById(productId2).select('embedding').lean()
      ]);

      if (!product1?.embedding || !product2?.embedding) {
        // Dự phòng về lọc cộng tác nếu không có embeddings
        return await this.getItemSimilarityCollaborative(productId1, productId2);
      }

      const similarity = this.cosineSimilarity(product1.embedding, product2.embedding);
      this.itemSimilarityCache.set(key, similarity);
      return similarity;

    } catch (error) {
      console.error(' Lỗi khi tính độ tương đồng sản phẩm:', error);
      return 0;
    }
  }

  /**
   * Độ tương đồng sản phẩm dựa trên lọc cộng tác (PHƯƠNG ÁN DỰ PHÒNG).
   */
  async getItemSimilarityCollaborative(productId1, productId2) {
    try {
      const users1 = await Interaction.distinct('userId', { productId: productId1 });
      const users2 = await Interaction.distinct('userId', { productId: productId2 });

      const intersection = users1.filter(u => 
        users2.some(u2 => u2.toString() === u.toString())
      );
      const union = [...new Set([...users1, ...users2])];

      return union.length > 0 ? intersection.length / union.length : 0;

    } catch (error) {
      console.error(' Lỗi trong độ tương đồng cộng tác:', error);
      return 0;
    }
  }

  async applyPopularityRanking(candidates, limit) {
    try {
      const rankedCandidates = [];

      for (const candidate of candidates) {
        const interactionCount = await Interaction.countDocuments({ 
          productId: candidate.productId 
        });

        const popularityScore = Math.min(interactionCount / 100, 1);

        rankedCandidates.push({
          ...candidate,
          collaborative_score: popularityScore,
          final_score: (candidate.content_score * 0.3) + (popularityScore * 0.7)
        });
      }

      rankedCandidates.sort((a, b) => b.final_score - a.final_score);
      return rankedCandidates.slice(0, limit);

    } catch (error) {
      console.error(' Lỗi trong xếp hạng độ phổ biến:', error);
      return candidates.slice(0, limit);
    }
  }

  async excludeInteractedItems(recommendations, userId) {
    try {
      const interactedProductIds = await Interaction.distinct('productId', { userId });
      
      return recommendations.filter(rec => 
        !interactedProductIds.some(id => id.toString() === rec.productId.toString())
      );

    } catch (error) {
      console.error(' Lỗi khi loại trừ các mục đã tương tác:', error);
      return recommendations;
    }
  }


  async getColdStartRecommendations(limit) {
    try {
      console.log('Đang sử dụng gợi ý khởi động nguội');

      const popularProducts = await Interaction.aggregate([
        {
          $group: {
            _id: '$productId',
            interactionCount: { $sum: 1 },
            avgWeight: { $avg: '$weight' }
          }
        },
        { $sort: { interactionCount: -1, avgWeight: -1 } },
        { $limit: limit }
      ]);

      const productIds = popularProducts.map(p => p._id);
      const products = await Product.find({ _id: { $in: productIds } })
        .populate('brand_id', 'name')
        .select('name price images brand_id');

      return products.map(product => ({
        productId: product._id,
        name: product.name,
        price: product.price,
        image: product.images?.mainImg?.url,
        brand: product.brand_id?.name,
        content_score: 0.5,
        collaborative_score: 0.5,
        final_score: 0.5
      }));

    } catch (error) {
      console.error(' Lỗi trong gợi ý khởi động nguội:', error);
      
      const products = await Product.find({ stock: { $gt: 0 } })
        .populate('brand_id', 'name')
        .select('name price images brand_id')
        .sort({ createdAt: -1 })
        .limit(limit);

      return products.map(product => ({
        productId: product._id,
        name: product.name,
        price: product.price,
        image: product.images?.mainImg?.url,
        brand: product.brand_id?.name,
        content_score: 0.5,
        collaborative_score: 0.5,
        final_score: 0.5
      }));
    }
  }

  cosineSimilarity(vecA, vecB) {
    if (vecA.length !== vecB.length) {
      console.error('Độ dài vector không khớp');
      return 0;
    }

    const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
    const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));

    if (magnitudeA === 0 || magnitudeB === 0) return 0;

    return dotProduct / (magnitudeA * magnitudeB);
  }

  normalizeVector(vector) {
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    return magnitude > 0 ? vector.map(val => val / magnitude) : vector;
  }

  clearCache() {
    this.itemSimilarityCache.clear();
    console.log(' Đã xóa bộ nhớ đệm độ tương đồng');
  }

  /**
   * DỰA TRÊN EMBEDDING: Tìm trực tiếp các sản phẩm tương tự.
   * Dùng cho tính năng "sản phẩm tương tự".
   */
  async getSimilarProducts(productId, limit = 10) {
    try {
      console.log(`🔍 Đang tìm sản phẩm tương tự cho ${productId}`);

      // 1. Lấy sản phẩm gốc kèm embedding
      const sourceProduct = await Product.findById(productId)
        .select('name embedding')
        .lean();

      if (!sourceProduct?.embedding) {
        console.log('⚠️ Sản phẩm không có embedding');
        return [];
      }

      // 2. Ưu tiên thử Vector Search
      if (this.useVectorSearch) {
        try {
          const results = await this.getSimilarProductsVectorSearch(
            productId,
            sourceProduct.embedding,
            limit
          );
          console.log(` Đã tìm thấy ${results.length} sản phẩm tương tự (Tìm kiếm Vector)`);
          return results;
        } catch (error) {
          console.log('⚠️ Tìm kiếm Vector thất bại, đang chuyển sang phương án dự phòng:', error.message);
          // Dự phòng về tính toán thủ công
        }
      }

      // 3. Tính toán thủ công (dự phòng)
      const allProducts = await Product.find({
        _id: { $ne: productId },
        embedding: { $exists: true, $ne: null, $not: { $size: 0 } }
      })
      .populate('brand_id', 'name')
      .populate('category_id', 'name')
      .select('name price images specifications brand_id category_id embedding')
      .lean();

      if (allProducts.length === 0) {
        return [];
      }

      // 4. Tính điểm độ tương đồng
      const similarities = allProducts.map(product => ({
        productId: product._id,
        name: product.name,
        price: product.price,
        image: product.images?.mainImg?.url,
        brand: product.brand_id?.name,
        similarity: this.cosineSimilarity(sourceProduct.embedding, product.embedding),
        final_score: this.cosineSimilarity(sourceProduct.embedding, product.embedding)
      }));

      // 5. Sắp xếp và trả về top N
      similarities.sort((a, b) => b.similarity - a.similarity);

      console.log(` Đã tìm thấy ${similarities.length} sản phẩm tương tự`);
      return similarities.slice(0, limit);

    } catch (error) {
      console.error(' Lỗi khi lấy sản phẩm tương tự:', error);
      throw error;
    }
  }

  /**
   * Tìm các sản phẩm tương tự bằng MongoDB Atlas Vector Search (NHANH!).
   */
  async getSimilarProductsVectorSearch(productId, embedding, limit = 10) {
    try {
      const results = await Product.aggregate([
        {
          $vectorSearch: {
            index: "vector_index",
            path: "embedding",
            queryVector: embedding,
            numCandidates: Math.min(limit * 4, 100),
            limit: limit + 10 // +10 để đảm bảo đủ số lượng sau khi lọc
          }
        },
        {
          $addFields: {
            similarity: { $meta: "vectorSearchScore" },
            final_score: { $meta: "vectorSearchScore" }
          }
        },
        {
          $match: {
            _id: { $ne: new mongoose.Types.ObjectId(productId) } // Loại trừ sản phẩm gốc
          }
        },
        {
          $lookup: {
            from: 'brands',
            localField: 'brand_id',
            foreignField: '_id',
            as: 'brand_id'
          }
        },
        {
          $lookup: {
            from: 'categories',
            localField: 'category_id',
            foreignField: '_id',
            as: 'category_id'
          }
        },
        {
          $unwind: {
            path: '$brand_id',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $project: {
            name: 1,
            price: 1,
            images: 1,
            specifications: 1,
            brand_id: { _id: 1, name: 1 },
            category_id: { _id: 1, name: 1 },
            similarity: 1,
            final_score: 1
          }
        },
        {
          $limit: limit
        }
      ]);

      return results.map(product => ({
        productId: product._id,
        name: product.name,
        price: product.price,
        image: product.images?.mainImg?.url,
        brand: product.brand_id?.name,
        similarity: product.similarity,
        final_score: product.final_score
      }));

    } catch (error) {
      console.error(' Lỗi tìm kiếm Vector:', error.message);
      throw error;
    }
  }
}

export default new RecommendationService();