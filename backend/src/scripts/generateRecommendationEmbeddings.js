import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Brand from '../models/Brand.js';
import Category from '../models/Category.js';
import Color from '../models/Color.js';
import embeddingService from '../services/embeddingService.js';
import textChunker from '../utils/textChunker.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * GENERATE RECOMMENDATION EMBEDDINGS
 * Tạo embeddings cho Recommendation System
 * Input: Specs + Price + Brand + Category + Tags
 */

async function generateRecommendationEmbeddings() {
  try {
    console.log('═'.repeat(80));
    console.log('🚀 GENERATING RECOMMENDATION EMBEDDINGS');
    console.log('═'.repeat(80));
    console.log('');

    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(' Connected!');
    console.log('');

    // Test HuggingFace connection
    console.log('🧪 Testing HuggingFace API...');
    const isConnected = await embeddingService.testConnection();
    if (!isConnected) {
      throw new Error('Failed to connect to HuggingFace API');
    }
    console.log('');

    // Get all products
    const products = await Product.find({})
      .populate('brand_id')
      .populate('category_id')
      .populate('color_id');

    console.log(`📦 Found ${products.length} products`);
    console.log('');

    // Filter products that need embeddings
    const productsToProcess = products.filter(p => 
      !p.embedding || p.embedding.length === 0
    );

    if (productsToProcess.length === 0) {
      console.log(' All products already have recommendation embeddings!');
      process.exit(0);
    }

    console.log(`🔄 Processing ${productsToProcess.length} products...`);
    console.log(`⏰ Estimated time: ~${Math.ceil(productsToProcess.length * 0.3 / 60)} minutes`);
    console.log('');

    let successCount = 0;
    let errorCount = 0;
    const startTime = Date.now();

    // Process each product
    for (let i = 0; i < productsToProcess.length; i++) {
      const product = productsToProcess[i];
      
      try {
        console.log(`\n[${ i + 1}/${productsToProcess.length}] ─────────────────────────`);
        console.log(`📦 ${product.name}`);

        // Create recommendation text
        const recText = textChunker.createRecommendationText(product);
        c
        const embedding = await embeddingService.createEmbedding(recText);

        // Update product
        await Product.findByIdAndUpdate(product._id, {
          embedding: embedding,
          recommendation_metadata: {
            model: embeddingService.getModelInfo().model,
            dimensions: embeddingService.getModelInfo().dimensions,
            generated_at: new Date(),
            input_features: ['name', 'specs', 'price', 'brand', 'category', 'tags']
          }
        });

        successCount++;
        console.log(` Success! (${(successCount / productsToProcess.length * 100).toFixed(1)}%)`);

      } catch (error) {
        errorCount++;
        console.error(` Error: ${error.message}`);
        
        // Continue with next product
        continue;
      }
    }

    // Summary
    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);

    console.log('\n' + '═'.repeat(80));
    console.log('🎉 GENERATION COMPLETED!');
    console.log('═'.repeat(80));
    console.log('');
    console.log(` Successful: ${successCount} products`);
    console.log(` Failed: ${errorCount} products`);
    console.log(`⏱️  Duration: ${Math.floor(duration / 60)}m ${duration % 60}s`);
    console.log(`📊 Average: ${(duration / productsToProcess.length).toFixed(1)}s per product`);
    console.log('');

    // Verify results
    const totalWithEmbedding = await Product.countDocuments({
      embedding: { $exists: true, $ne: null, $not: { $size: 0 } }
    });
    const totalProducts = await Product.countDocuments();

    console.log('📊 FINAL STATISTICS:');
    console.log(`   Total products: ${totalProducts}`);
    console.log(`   With embeddings: ${totalWithEmbedding} (${(totalWithEmbedding/totalProducts*100).toFixed(1)}%)`);
    console.log(`   Without embeddings: ${totalProducts - totalWithEmbedding}`);
    console.log('');

    if (totalWithEmbedding === totalProducts) {
      console.log('🎊 ALL PRODUCTS NOW HAVE RECOMMENDATION EMBEDDINGS!');
      console.log('');
      console.log('💡 Next step:');
      console.log('   node src/scripts/generateRagEmbeddings.js');
    } else {
      console.log('⚠️  Some products still missing embeddings.');
      console.log('💡 You may want to run this script again.');
    }
    console.log('');

  } catch (error) {
    console.error(' Fatal error:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

// RUN
generateRecommendationEmbeddings();
