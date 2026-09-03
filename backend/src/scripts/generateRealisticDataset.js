import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Brand from '../models/Brand.js';
import Category from '../models/Category.js';
import Color from '../models/Color.js';
import Interaction from '../models/Interaction.js';
import Feedback from '../models/Feedback.js';
import UserRecommendationProfile from '../models/UserProfile.js';
import profileUpdateService from '../services/profileUpdateService.js';

dotenv.config();

// ============================================================================
// 1. CẤU HÌNH 8 PHÂN KHÚC KHÁCH HÀNG (8 USER PERSONAS)
// ============================================================================
const PERSONAS = [
  {
    id: 'student_office',
    name: 'Sinh viên / Văn phòng cơ bản',
    weight: 0.25, // 25% tổng số user
    budgetMin: 8000000,
    budgetMax: 18000000,
    preferredBrands: ['Asus', 'Acer', 'HP', 'Lenovo', 'Dell'],
    keywords: ['Vivobook', 'Aspire', 'Pavilion', 'Ideapad', 'Inspiron', 'Modern', 'Swift'],
    preferredGpuTypes: ['integrated', 'Intel UHD', 'Intel Iris', 'AMD Radeon'],
    preferredRam: ['8GB', '16GB'],
    interactionActivity: { minSessions: 2, maxSessions: 5, itemsPerSession: 4 }
  },
  {
    id: 'casual_gamer',
    name: 'Sinh viên kỹ thuật / Casual Gamer',
    weight: 0.20, // 20%
    budgetMin: 18000000,
    budgetMax: 28000000,
    preferredBrands: ['Asus', 'Acer', 'Lenovo', 'HP', 'MSI', 'Gigabyte'],
    keywords: ['TUF', 'Nitro', 'LOQ', 'Victus', 'Katana', 'Bravo', 'Cyborg', 'Gaming'],
    preferredGpuTypes: ['RTX 3050', 'RTX 4050', 'RTX 2050', 'GTX 1650', 'RX 6500'],
    preferredRam: ['16GB', '8GB', '32GB'],
    interactionActivity: { minSessions: 3, maxSessions: 7, itemsPerSession: 5 }
  },
  {
    id: 'hardcore_gamer',
    name: 'Hardcore Gamer / Streamer',
    weight: 0.10, // 10%
    budgetMin: 30000000,
    budgetMax: 75000000,
    preferredBrands: ['Asus', 'Lenovo', 'Acer', 'MSI', 'Razer', 'Dell Alienware'],
    keywords: ['ROG', 'Strix', 'Zephyrus', 'Legion', 'Predator', 'Helios', 'Raider', 'Titan', 'Alienware'],
    preferredGpuTypes: ['RTX 4060', 'RTX 4070', 'RTX 4080', 'RTX 4090', 'RTX 3070', 'RTX 3080'],
    preferredRam: ['16GB', '32GB', '64GB'],
    interactionActivity: { minSessions: 4, maxSessions: 9, itemsPerSession: 6 }
  },
  {
    id: 'creator_designer',
    name: 'Designer / Video Editor / 3D Creator',
    weight: 0.12, // 12%
    budgetMin: 25000000,
    budgetMax: 65000000,
    preferredBrands: ['Apple', 'Dell', 'Asus', 'Lenovo', 'HP'],
    keywords: ['MacBook', 'XPS', 'ProArt', 'Yoga Pro', 'Creator', 'Zenbook Pro', 'OLED', 'Studio'],
    preferredGpuTypes: ['Apple M2', 'Apple M3', 'RTX 4060', 'RTX 4070', 'RTX 3060', 'RTX 4050'],
    preferredRam: ['16GB', '32GB', '64GB'],
    interactionActivity: { minSessions: 3, maxSessions: 6, itemsPerSession: 5 }
  },
  {
    id: 'developer_it',
    name: 'Lập trình viên / Kỹ sư CNTT',
    weight: 0.13, // 13%
    budgetMin: 22000000,
    budgetMax: 50000000,
    preferredBrands: ['Lenovo', 'Apple', 'Dell', 'Asus'],
    keywords: ['ThinkPad', 'MacBook', 'Latitude', 'Zenbook', 'Legion', 'Precision'],
    preferredGpuTypes: ['Intel Iris', 'Apple M2', 'Apple M3', 'RTX 4050', 'RTX 3050'],
    preferredRam: ['16GB', '32GB', '64GB'],
    interactionActivity: { minSessions: 3, maxSessions: 6, itemsPerSession: 5 }
  },
  {
    id: 'business_executive',
    name: 'Doanh nhân / Di chuyển nhiều',
    weight: 0.10, // 10%
    budgetMin: 25000000,
    budgetMax: 55000000,
    preferredBrands: ['Lenovo', 'Apple', 'Dell', 'LG', 'HP'],
    keywords: ['ThinkPad X1', 'MacBook Air', 'Gram', 'EliteBook', 'Spectre', 'XPS 13', 'Envy'],
    preferredGpuTypes: ['integrated', 'Intel Iris', 'Apple M2', 'Apple M3'],
    preferredRam: ['16GB', '32GB'],
    interactionActivity: { minSessions: 2, maxSessions: 4, itemsPerSession: 4 }
  },
  {
    id: 'brand_loyalist',
    name: 'Brand Loyalist (Apple / Dell Fan)',
    weight: 0.05, // 5%
    budgetMin: 15000000,
    budgetMax: 80000000,
    preferredBrands: ['Apple', 'Dell'],
    keywords: ['MacBook', 'XPS', 'Inspiron', 'Latitude'],
    preferredGpuTypes: [],
    preferredRam: [],
    interactionActivity: { minSessions: 2, maxSessions: 5, itemsPerSession: 4 }
  },
  {
    id: 'budget_hunter',
    name: 'Budget Shopper (Săn máy rẻ / Deal hời)',
    weight: 0.05, // 5%
    budgetMin: 6000000,
    budgetMax: 14000000,
    preferredBrands: ['Acer', 'Asus', 'Lenovo', 'HP'],
    keywords: ['Aspire', 'Vivobook', 'Ideapad', '14', '15'],
    preferredGpuTypes: ['integrated', 'Intel UHD', 'Intel HD'],
    preferredRam: ['8GB', '4GB', '16GB'],
    interactionActivity: { minSessions: 2, maxSessions: 4, itemsPerSession: 3 }
  }
];

// Danh sách họ tên tiếng Việt thực tế
const HO = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý'];
const DEM_NAM = ['Văn', 'Hữu', 'Minh', 'Đức', 'Quốc', 'Tuấn', 'Thành', 'Hoàng', 'Hải', 'Anh', 'Trọng'];
const DEM_NU = ['Thị', 'Ngọc', 'Phương', 'Mai', 'Thanh', 'Kim', 'Thùy', 'Hương', 'Mỹ', 'Ánh'];
const TEN_NAM = ['Huy', 'Hùng', 'Nam', 'Long', 'Dũng', 'Tùng', 'Khoa', 'Phong', 'Kiên', 'Bảo', 'Phúc', 'Lâm', 'Sơn', 'Đạt', 'Hiếu'];
const TEN_NU = ['Trang', 'Linh', 'Hà', 'Nhi', 'Anh', 'Vy', 'Châu', 'Tâm', 'Huyền', 'Thảo', 'Yến', 'Quỳnh', 'Mai', 'Hoa'];
const CITIES = ['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ', 'Bình Dương', 'Đồng Nai', 'Huế', 'Nha Trang'];

const REVIEW_COMMENTS = {
  positive: [
    'Máy dùng rất mượt, khởi động nhanh chỉ 5s. Màn hình sắc nét và pin trâu.',
    'Rất hài lòng với sản phẩm, chiến game max setting mượt mà, tản nhiệt khá êm.',
    'Thiết kế đẹp sang trọng, gõ phím cực kỳ sướng tay, phù hợp mang đi làm việc.',
    'Hiệu năng vượt trội trong tầm giá, render video 4K không bị giật lag.',
    'Giao hàng nhanh, đóng gói cẩn thận. Laptop nhẹ và tiện mang theo đi học.',
    'Đúng như mô tả, màn hình đẹp, loa to rõ ràng. 10/10 điểm!'
  ],
  moderate: [
    'Máy dùng ổn trong tầm giá, tuy nhiên khi render hoặc chơi game nặng thì quạt hơi ồn.',
    'Cấu hình tốt, nhưng pin chỉ được khoảng 4-5 tiếng nếu dùng tác vụ nặng.',
    'Màn hình hiển thị đẹp, phím hơi nông một chút nhưng dùng quen thì ổn.'
  ],
  critical: [
    'Máy hơi nóng khi chơi game lâu, cần thêm đế tản nhiệt.',
    'Thời lượng pin chưa thực sự ấn tượng so với kỳ vọng.'
  ]
};

// Tiện ích random
function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateVietnameseName() {
  const isMale = Math.random() > 0.45;
  const ho = randomChoice(HO);
  const dem = isMale ? randomChoice(DEM_NAM) : randomChoice(DEM_NU);
  const ten = isMale ? randomChoice(TEN_NAM) : randomChoice(TEN_NU);
  return { name: `${ho} ${dem} ${ten}`, isMale };
}

function removeAccents(str) {
  return str.normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/\s+/g, '');
}

/**
 * Thuật toán tính điểm tương quan sản phẩm với Persona
 */
function scoreProductForPersona(product, persona) {
  let score = 0;
  const brandName = product.brand_id?.name || '';
  const productName = `${product.name || ''} ${product.title || ''} ${product.description || ''}`;
  const price = product.price || 0;
  const specs = product.specifications || {};

  // 1. Phù hợp khoảng giá (Rất quan trọng)
  if (price >= persona.budgetMin && price <= persona.budgetMax) {
    score += 50;
  } else if (price < persona.budgetMin) {
    score += 20; // Rẻ hơn ngân sách vẫn có thể xem
  } else if (price <= persona.budgetMax * 1.25) {
    score += 15; // Hơi quá ngân sách một chút (xem tham khảo)
  } else {
    score -= 40; // Quá xa ngân sách
  }

  // 2. Phù hợp Thương hiệu
  if (persona.preferredBrands.some(b => brandName.toLowerCase().includes(b.toLowerCase()))) {
    score += 30;
  }

  // 3. Khớp Keyword dòng máy
  for (const kw of persona.keywords) {
    if (productName.toLowerCase().includes(kw.toLowerCase())) {
      score += 25;
      break;
    }
  }

  // 4. Khớp GPU / Specs
  const gpuText = (specs.gpu || specs.graphics || '').toLowerCase();
  for (const gpuKw of (persona.preferredGpuTypes || [])) {
    if (gpuText.includes(gpuKw.toLowerCase())) {
      score += 20;
      break;
    }
  }

  // 5. Khớp RAM
  const ramText = (specs.ram || '').toLowerCase();
  for (const ramKw of (persona.preferredRam || [])) {
    if (ramKw.includes(ramKw.toLowerCase())) {
      score += 10;
      break;
    }
  }

  return score;
}

// ============================================================================
// HÀM CHÍNH: GENERATE DATASET
// ============================================================================
export async function generateRealisticDataset(options = {}) {
  const {
    totalUsers = 80,             // Tạo 80 người dùng mô phỏng chân thực
    daysSpan = 45,               // Trải rộng trong 45 ngày
    cleanOldData = true          // Dọn dẹp dữ liệu tương tác test cũ
  } = options;

  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/laptop-ecommerce';
    await mongoose.connect(mongoUri);
    console.log('\n=============================================================');
    console.log('🚀 BẮT ĐẦU SINH DỮ LIỆU TƯƠNG TÁC SIÊU CHÂN THỰC CHO HYBRID MODEL');
    console.log('=============================================================\n');

    // 1. Tải toàn bộ sản phẩm
    const products = await Product.find()
      .populate('brand_id', 'name')
      .populate('category_id', 'name');

    if (!products || products.length === 0) {
      throw new Error('❌ Không tìm thấy sản phẩm nào trong database! Vui lòng import sản phẩm trước.');
    }
    console.log(`📦 Đã nạp ${products.length} sản phẩm laptop từ MongoDB.`);

    // 2. Dọn dẹp dữ liệu tương tác cũ nếu được yêu cầu
    if (cleanOldData) {
      console.log('🧹 Đang xóa các tương tác giả lập cũ để đảm bảo tính nhất quán...');
      // Xóa các user mock có đuôi email @simuser.vn hoặc @example.com
      const oldMockUsers = await User.find({
        email: { $regex: /@(simuser\.vn|example\.com)$/i }
      });
      const oldUserIds = oldMockUsers.map(u => u._id);
      
      await Interaction.deleteMany({ userId: { $in: oldUserIds } });
      await Feedback.deleteMany({ user_id: { $in: oldUserIds } });
      await UserRecommendationProfile.deleteMany({ userId: { $in: oldUserIds } });
      await User.deleteMany({ _id: { $in: oldUserIds } });
      console.log(`🧹 Đã dọn dẹp sạch sẽ ${oldMockUsers.length} user giả lập cũ.\n`);
    }

    // 3. Phân bổ và tạo danh sách người dùng theo Persona Weights
    console.log(`👥 Đang khởi tạo ${totalUsers} người dùng thuộc 8 nhóm Persona thực tế...`);
    const createdUsers = [];

    for (let i = 0; i < totalUsers; i++) {
      // Chọn persona: nếu chạy thử nghiệm (ít user) thì lấy lần lượt đủ 8 persona, nếu chạy nhiều thì theo trọng số
      let selectedPersona = PERSONAS[0];
      if (totalUsers <= PERSONAS.length) {
        selectedPersona = PERSONAS[i % PERSONAS.length];
      } else {
        let rand = Math.random();
        let cumulative = 0;
        for (const p of PERSONAS) {
          cumulative += p.weight;
          if (rand <= cumulative) {
            selectedPersona = p;
            break;
          }
        }
      }

      const { name } = generateVietnameseName();
      const emailBase = removeAccents(name);
      const email = `${emailBase}${getRandomInt(100, 999)}@simuser.vn`;
      const city = randomChoice(CITIES);

      const userDoc = await User.create({
        name,
        email,
        password_hash: 'password123',
        phone: `09${getRandomInt(10000000, 99999999)}`,
        address: `${getRandomInt(1, 200)} Đường số ${getRandomInt(1, 30)}, ${city}`,
        role: 'user'
      });

      createdUsers.push({
        userDoc,
        persona: selectedPersona
      });
    }

    console.log(`✅ Đã tạo thành công ${createdUsers.length} người dùng mới.\n`);

    // 4. Mô phỏng hành vi mua sắm (Shopping Journey Sessions)
    console.log('🛒 Đang mô phỏng các phiên duyệt web, so sánh và mua hàng...');
    let totalInteractions = 0;
    let totalPurchases = 0;
    let totalFeedbacks = 0;
    let totalCarts = 0;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysSpan);

    for (let uIdx = 0; uIdx < createdUsers.length; uIdx++) {
      const { userDoc, persona } = createdUsers[uIdx];

      // Đánh giá và xếp hạng sản phẩm theo độ phù hợp với persona này
      const scoredProducts = products.map(p => ({
        product: p,
        score: scoreProductForPersona(p, persona) + (Math.random() * 20 - 10) // Có chút tính ngẫu nhiên
      })).sort((a, b) => b.score - a.score);

      // Top candidate pool phù hợp nhất với user này (15-25 máy)
      const topPool = scoredProducts.slice(0, getRandomInt(15, 25)).map(item => item.product);
      // Background pool: Một số máy ngẫu nhiên ngoài lề (user tình cờ thấy trên trang chủ/banner)
      const noisePool = products.sort(() => 0.5 - Math.random()).slice(0, 5);
      const userCandidatePool = [...topPool, ...noisePool];

      // Số lượng Session mua sắm của user này
      const numSessions = getRandomInt(
        persona.interactionActivity.minSessions,
        persona.interactionActivity.maxSessions
      );

      // User có quyết định mua hàng trong chu kỳ này không (65% user có mua ít nhất 1 máy)
      const willPurchase = Math.random() < 0.65;
      let purchasedProduct = null;

      // Chia thời gian các session rải rác từ startDate đến hiện tại
      let currentSessionTime = new Date(startDate.getTime() + (uIdx * (daysSpan / totalUsers) * 86400000 * 0.5));

      for (let s = 0; s < numSessions; s++) {
        const sessionId = `sess_${userDoc._id.toString().slice(-6)}_${s}_${Date.now()}`;
        currentSessionTime = new Date(currentSessionTime.getTime() + getRandomInt(1, 4) * 86400000 + getRandomInt(1000, 3600000));
        if (currentSessionTime > new Date()) currentSessionTime = new Date();

        // Chọn các sản phẩm được xem trong session này
        const itemsToBrowseCount = getRandomInt(2, persona.interactionActivity.itemsPerSession);
        const sessionProducts = userCandidatePool.sort(() => 0.5 - Math.random()).slice(0, itemsToBrowseCount);

        for (const prod of sessionProducts) {
          // 1. Tương tác VIEW (100% có khi click vào sản phẩm)
          // Thời gian nán lại (Dwell time) phản ánh mức độ quan tâm:
          // Nếu sản phẩm điểm cao -> đọc kỹ (60s - 250s)
          // Nếu sản phẩm ngẫu nhiên/không ưng -> lướt nhanh (5s - 25s)
          const isHighInterest = topPool.slice(0, 5).some(p => p._id.equals(prod._id));
          const dwellTime = isHighInterest ? getRandomInt(75, 280) : getRandomInt(8, 45);

          const viewTimestamp = new Date(currentSessionTime.getTime() + getRandomInt(10000, 180000));
          
          await Interaction.create({
            userId: userDoc._id,
            productId: prod._id,
            type: 'view',
            weight: 1,
            metadata: {
              duration: dwellTime,
              source: isHighInterest ? (Math.random() > 0.4 ? 'search' : 'recommendation') : 'category_browse',
              session_id: sessionId
            },
            createdAt: viewTimestamp,
            updatedAt: viewTimestamp
          });
          totalInteractions++;

          // 2. Tương tác SEARCH_CLICK hoặc LIKE
          if (isHighInterest && Math.random() < 0.65) {
            const isLike = Math.random() < 0.5;
            const actType = isLike ? 'like' : 'search_click';
            const actTimestamp = new Date(viewTimestamp.getTime() + getRandomInt(5000, 30000));

            await Interaction.create({
              userId: userDoc._id,
              productId: prod._id,
              type: actType,
              weight: isLike ? 3 : 2,
              metadata: {
                source: 'product_detail',
                session_id: sessionId
              },
              createdAt: actTimestamp,
              updatedAt: actTimestamp
            });
            totalInteractions++;

            // Thêm vào wishlist feedback nếu Like
            if (isLike && Math.random() < 0.5) {
              await Feedback.findOneAndUpdate(
                { user_id: userDoc._id, product_id: prod._id },
                { wishlist: true },
                { upsert: true, new: true }
              );
            }
          }

          // 3. Tương tác ADD TO CART (Thêm vào giỏ hàng)
          if (isHighInterest && Math.random() < 0.40) {
            const cartTimestamp = new Date(viewTimestamp.getTime() + getRandomInt(45000, 180000));
            await Interaction.create({
              userId: userDoc._id,
              productId: prod._id,
              type: 'add_to_cart',
              weight: 5,
              metadata: {
                source: 'product_detail',
                session_id: sessionId
              },
              createdAt: cartTimestamp,
              updatedAt: cartTimestamp
            });
            totalInteractions++;
            totalCarts++;

            // Hành vi do dự: 20% khả năng xóa khỏi giỏ hàng nếu thấy máy khác tốt hơn
            if (Math.random() < 0.20 && !willPurchase) {
              const removeTimestamp = new Date(cartTimestamp.getTime() + getRandomInt(60000, 600000));
              await Interaction.create({
                userId: userDoc._id,
                productId: prod._id,
                type: 'remove_from_cart',
                weight: 0,
                metadata: {
                  source: 'cart_page',
                  session_id: sessionId
                },
                createdAt: removeTimestamp,
                updatedAt: removeTimestamp
              });
              totalInteractions++;
            } else if (willPurchase && !purchasedProduct) {
              // Chọn máy này làm sản phẩm sẽ mua ở session cuối
              purchasedProduct = prod;
            }
          }
        }
      }

      // 4. Tương tác PURCHASE & RATING (Chốt đơn mua và Đánh giá)
      if (willPurchase && purchasedProduct) {
        const purchaseDate = new Date(currentSessionTime.getTime() + getRandomInt(3600000, 24 * 3600000));
        if (purchaseDate > new Date()) purchaseDate.setTime(Date.now() - 3600000);

        await Interaction.create({
          userId: userDoc._id,
          productId: purchasedProduct._id,
          type: 'purchase',
          weight: 10,
          metadata: {
            source: 'checkout_success',
            session_id: `sess_purchase_${userDoc._id.toString().slice(-6)}`
          },
          createdAt: purchaseDate,
          updatedAt: purchaseDate
        });
        totalInteractions++;
        totalPurchases++;

        // 75% khách hàng sau khi nhận máy 2-5 ngày sẽ để lại đánh giá (Explicit Feedback)
        if (Math.random() < 0.75) {
          const ratingDate = new Date(purchaseDate.getTime() + getRandomInt(2, 5) * 86400000);
          if (ratingDate > new Date()) ratingDate.setTime(Date.now());

          // Đa số hài lòng (4-5 sao), một số ít chấm 3 sao
          const ratingVal = Math.random() < 0.85 ? (Math.random() < 0.6 ? 5 : 4) : 3;
          const commentPool = ratingVal === 5 ? REVIEW_COMMENTS.positive : (ratingVal === 4 ? [...REVIEW_COMMENTS.positive, ...REVIEW_COMMENTS.moderate] : REVIEW_COMMENTS.critical);
          const reviewComment = randomChoice(commentPool);

          await Interaction.create({
            userId: userDoc._id,
            productId: purchasedProduct._id,
            type: 'rating',
            weight: 8,
            metadata: {
              rating_value: ratingVal,
              source: 'order_review_modal'
            },
            createdAt: ratingDate,
            updatedAt: ratingDate
          });
          totalInteractions++;

          await Feedback.findOneAndUpdate(
            { user_id: userDoc._id, product_id: purchasedProduct._id },
            {
              rating: ratingVal,
              comment: reviewComment,
              wishlist: false
            },
            { upsert: true, new: true }
          );
          totalFeedbacks++;
        }
      }

      // 5. Cập nhật Preferences và tính User Embedding 384 chiều
      const userInteractions = await Interaction.find({ userId: userDoc._id });
      for (const inter of userInteractions) {
        await profileUpdateService.updateUserProfile(
          inter.userId,
          inter.productId,
          inter.type,
          inter.metadata
        );
      }
      // Tính vector đại diện cho user
      await profileUpdateService.updateUserEmbedding(userDoc._id);

      if ((uIdx + 1) % 10 === 0 || uIdx === createdUsers.length - 1) {
        console.log(`   ⏳ Đã xử lý và cập nhật hồ sơ cho ${uIdx + 1}/${createdUsers.length} người dùng...`);
      }
    }

    console.log('\n=============================================================');
    console.log('🎉 TỔNG KẾT KẾT QUẢ SINH DỮ LIỆU TƯƠNG TÁC:');
    console.log('=============================================================');
    console.log(`👤 Tổng số người dùng mô phỏng:   ${createdUsers.length}`);
    console.log(`🔄 Tổng số lượt tương tác (Logs): ${totalInteractions}`);
    console.log(`🛒 Lượt thêm vào giỏ hàng:         ${totalCarts}`);
    console.log(`💳 Số đơn mua hàng (Purchase):    ${totalPurchases}`);
    console.log(`⭐ Số lượt đánh giá (Reviews):     ${totalFeedbacks}`);
    console.log('🧬 Tất cả hồ sơ User Profile & Embeddings 384 dims đã cập nhật 100%');
    console.log('=============================================================\n');

    return {
      totalUsers: createdUsers.length,
      totalInteractions,
      totalPurchases,
      totalFeedbacks
    };

  } catch (error) {
    console.error('❌ Lỗi khi sinh dữ liệu tương tác:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Đã ngắt kết nối MongoDB.');
  }
}

// Chạy trực tiếp nếu gọi từ CLI
if (process.argv[1] && process.argv[1].endsWith('generateRealisticDataset.js')) {
  const args = process.argv.slice(2);
  let totalUsers = 80;
  let daysSpan = 45;

  args.forEach(arg => {
    if (arg.startsWith('--users=')) {
      totalUsers = parseInt(arg.split('=')[1], 10) || totalUsers;
    } else if (arg === '--trial') {
      totalUsers = 8; // Thử nghiệm 1 user cho mỗi 1 trong 8 persona
      daysSpan = 15;
    } else if (arg.startsWith('--days=')) {
      daysSpan = parseInt(arg.split('=')[1], 10) || daysSpan;
    }
  });

  generateRealisticDataset({ totalUsers, daysSpan });
}
