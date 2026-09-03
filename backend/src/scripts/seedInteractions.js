import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Interaction from '../models/Interaction.js';
import UserRecommendationProfile from '../models/UserProfile.js';
import profileUpdateService from '../services/profileUpdateService.js';

dotenv.config();

// Danh sách các Persona mẫu để tạo hành vi giả lập chân thực
const SAMPLE_USERS = [
  {
    name: 'Nguyễn Văn Gamer',
    email: 'gamer@example.com',
    password_hash: 'password123',
    phone: '0901234561',
    address: 'Hà Nội',
    persona: 'gaming',
    keywords: ['Gaming', 'ROG', 'TUF', 'Legion', 'Nitro', 'RTX', 'MSI', 'Predator']
  },
  {
    name: 'Trần Thị Đồ Họa',
    email: 'creator@example.com',
    password_hash: 'password123',
    phone: '0901234562',
    address: 'TP. Hồ Chí Minh',
    persona: 'creator',
    keywords: ['MacBook', 'XPS', 'OLED', 'Yoga', 'Creator', 'Zenbook', 'Studio']
  },
  {
    name: 'Lê Văn Sinh Viên',
    email: 'student@example.com',
    password_hash: 'password123',
    phone: '0901234563',
    address: 'Đà Nẵng',
    persona: 'budget',
    maxPrice: 18000000,
    keywords: ['Vivobook', 'Inspiron', 'Pavilion', 'Ideapad', 'Aspire']
  },
  {
    name: 'Phạm Doanh Nhân',
    email: 'business@example.com',
    password_hash: 'password123',
    phone: '0901234564',
    address: 'Hà Nội',
    persona: 'business',
    keywords: ['ThinkPad', 'Latitude', 'EliteBook', 'Envy', 'Gram']
  },
  {
    name: 'Hoàng Lập Trình',
    email: 'dev@example.com',
    password_hash: 'password123',
    phone: '0901234565',
    address: 'Cần Thơ',
    persona: 'developer',
    keywords: ['ThinkPad', 'MacBook', 'Legion', 'Pro', '16GB', '32GB']
  }
];

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomDate(daysAgo = 30) {
  const date = new Date();
  date.setDate(date.getDate() - getRandomInt(0, daysAgo));
  date.setHours(getRandomInt(8, 23), getRandomInt(0, 59), getRandomInt(0, 59));
  return date;
}

async function seedMockInteractions() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/laptop-ecommerce';
    await mongoose.connect(mongoUri);
    console.log('✅ Đã kết nối MongoDB thành công');

    // 1. Lấy danh sách sản phẩm hiện có
    const allProducts = await Product.find().populate('brand_id').populate('category_id');
    if (allProducts.length === 0) {
      console.error('❌ Không tìm thấy sản phẩm nào trong database! Vui lòng import sản phẩm trước.');
      process.exit(1);
    }
    console.log(`📦 Tìm thấy ${allProducts.length} sản phẩm trong database`);

    // 2. Tạo hoặc lấy User mẫu
    const users = [];
    for (const u of SAMPLE_USERS) {
      let user = await User.findOne({ email: u.email });
      if (!user) {
        user = await User.create({
          name: u.name,
          email: u.email,
          password_hash: u.password_hash,
          phone: u.phone,
          address: u.address,
          role: 'user'
        });
        console.log(`👤 Đã tạo người dùng mới: ${user.name} (${user.email})`);
      } else {
        console.log(`👤 Sử dụng người dùng đã có: ${user.name} (${user.email})`);
      }
      users.push({ userDoc: user, config: u });
    }

    // 3. Xóa các interaction và profile cũ của các user này (nếu muốn làm mới)
    const userIds = users.map(u => u.userDoc._id);
    await Interaction.deleteMany({ userId: { $in: userIds } });
    await UserRecommendationProfile.deleteMany({ userId: { $in: userIds } });
    console.log('🧹 Đã dọn dẹp dữ liệu tương tác & profile cũ của các user test\n');

    // 4. Sinh dữ liệu tương tác theo từng Persona
    let totalCreatedInteractions = 0;

    for (const { userDoc, config } of users) {
      console.log(`🚀 Đang sinh tương tác cho: [${userDoc.name}] - Persona: ${config.persona}...`);

      // Lọc các sản phẩm phù hợp với sở thích của persona
      let relevantProducts = allProducts.filter(p => {
        const text = `${p.name || ''} ${p.title || ''} ${p.description || ''} ${p.brand_id?.name || ''}`.toLowerCase();
        const matchesKeyword = config.keywords.some(k => text.includes(k.toLowerCase()));
        const matchesPrice = config.maxPrice ? (p.price || 0) <= config.maxPrice : true;
        return matchesKeyword && matchesPrice;
      });

      // Nếu không tìm thấy đủ, lấy ngẫu nhiên thêm một số sản phẩm khác
      if (relevantProducts.length < 5) {
        relevantProducts = allProducts.slice(0, 15);
      }

      // Chọn 8 - 15 sản phẩm để tương tác
      const targetProducts = relevantProducts.sort(() => 0.5 - Math.random()).slice(0, getRandomInt(8, 15));

      for (const product of targetProducts) {
        // Mô phỏng phễu hành vi (Funnel):
        // 100% có 'view'
        // 60% có 'like' hoặc 'search_click'
        // 35% có 'add_to_cart'
        // 15% có 'purchase' & 'rating'

        const interactionsToCreate = [];

        // 1. Tương tác VIEW
        const viewDuration = getRandomInt(15, 240); // 15s -> 4 phút
        const viewDate = getRandomDate(20);
        interactionsToCreate.push({
          userId: userDoc._id,
          productId: product._id,
          type: 'view',
          weight: 1,
          metadata: {
            duration: viewDuration,
            source: Math.random() > 0.5 ? 'search' : 'recommendation',
            session_id: `sess_${Date.now()}_${getRandomInt(100, 999)}`
          },
          createdAt: viewDate,
          updatedAt: viewDate
        });

        // 2. Tương tác SEARCH_CLICK hoặc LIKE
        if (Math.random() < 0.6) {
          const isLike = Math.random() < 0.5;
          const actType = isLike ? 'like' : 'search_click';
          const actDate = new Date(viewDate.getTime() + getRandomInt(5000, 30000));
          interactionsToCreate.push({
            userId: userDoc._id,
            productId: product._id,
            type: actType,
            weight: isLike ? 3 : 2,
            metadata: {
              source: 'search',
              session_id: `sess_${Date.now()}_${getRandomInt(100, 999)}`
            },
            createdAt: actDate,
            updatedAt: actDate
          });
        }

        // 3. Tương tác ADD TO CART
        if (Math.random() < 0.35) {
          const cartDate = new Date(viewDate.getTime() + getRandomInt(60000, 300000));
          interactionsToCreate.push({
            userId: userDoc._id,
            productId: product._id,
            type: 'add_to_cart',
            weight: 5,
            metadata: {
              source: 'product_detail',
              session_id: `sess_${Date.now()}_${getRandomInt(100, 999)}`
            },
            createdAt: cartDate,
            updatedAt: cartDate
          });

          // 4. Tương tác PURCHASE & RATING
          if (Math.random() < 0.45) {
            const purchaseDate = new Date(cartDate.getTime() + getRandomInt(3600000, 86400000));
            interactionsToCreate.push({
              userId: userDoc._id,
              productId: product._id,
              type: 'purchase',
              weight: 10,
              metadata: {
                source: 'checkout',
                session_id: `sess_${Date.now()}_${getRandomInt(100, 999)}`
              },
              createdAt: purchaseDate,
              updatedAt: purchaseDate
            });

            // Đánh giá 4 - 5 sao
            const ratingValue = getRandomInt(4, 5);
            interactionsToCreate.push({
              userId: userDoc._id,
              productId: product._id,
              type: 'rating',
              weight: 8,
              metadata: {
                rating_value: ratingValue,
                source: 'order_review'
              },
              createdAt: new Date(purchaseDate.getTime() + 86400000),
              updatedAt: new Date(purchaseDate.getTime() + 86400000)
            });
          }
        }

        // Lưu vào DB và cập nhật Preferences thông qua profileUpdateService
        for (const inter of interactionsToCreate) {
          await Interaction.create(inter);
          totalCreatedInteractions++;
          await profileUpdateService.updateUserProfile(
            inter.userId,
            inter.productId,
            inter.type,
            inter.metadata
          );
        }
      }

      // 5. Cập nhật User Embedding (384 chiều) cho User
      console.log(`   🧬 Đang tính toán User Embedding cho ${userDoc.name}...`);
      await profileUpdateService.updateUserEmbedding(userDoc._id);
      console.log(`   ✅ Hoàn tất hồ sơ cho ${userDoc.name}\n`);
    }

    console.log('🎉 ============================================== 🎉');
    console.log(`✅ ĐÃ TẠO THÀNH CÔNG ${totalCreatedInteractions} LƯỢT TƯƠNG TÁC GIẢ LẬP!`);
    console.log(`👥 Đã cập nhật đầy đủ User Profile & Embeddings cho ${users.length} người dùng.`);
    console.log('🎉 ============================================== 🎉\n');

  } catch (error) {
    console.error('❌ Lỗi trong quá trình seed tương tác:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Đã ngắt kết nối MongoDB.');
  }
}

seedMockInteractions();
