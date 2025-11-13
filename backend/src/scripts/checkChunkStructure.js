import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';

dotenv.config();

async function checkChunkStructure() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected\n');

    const product = await Product.findOne({ document_chunks: { $exists: true, $ne: [] } });

    if (product && product.document_chunks && product.document_chunks.length > 0) {
      console.log('📦 Product:', product.name);
      console.log(`\n📝 Total chunks: ${product.document_chunks.length}`);
      console.log('\n🔍 First chunk structure:');
      console.log(JSON.stringify(product.document_chunks[0], null, 2));
      
      console.log('\n📊 Chunk types:');
      const chunk = product.document_chunks[0];
      console.log(`   - content: ${typeof chunk.content}`);
      console.log(`   - embedding: ${typeof chunk.embedding} (${Array.isArray(chunk.embedding) ? `array[${chunk.embedding?.length}]` : 'not array'})`);
      console.log(`   - metadata: ${typeof chunk.metadata}`);
    } else {
      console.log('⚠️  No product with chunks found');
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkChunkStructure();
