import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';
import Brand from '../models/Brand.js';

dotenv.config();

async function checkBrands() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const brands = await Brand.find().sort({ name: 1 });
    
    console.log('📊 THỐNG KÊ SẢN PHẨM THEO BRAND:\n');
    console.log('─'.repeat(60));
    
    let total = 0;
    for (const brand of brands) {
      const count = await Product.countDocuments({ brand_id: brand._id });
      total += count;
      console.log(`${brand.name.padEnd(20)} : ${count.toString().padStart(3)} sản phẩm`);
      console.log(`   ID: ${brand._id}`);
      console.log('─'.repeat(60));
    }
    
    console.log(`\nTổng cộng: ${total} sản phẩm\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected');
  }
}

checkBrands();
