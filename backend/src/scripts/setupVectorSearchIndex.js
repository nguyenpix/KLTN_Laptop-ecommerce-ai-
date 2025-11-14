import 'dotenv/config';
import mongoose from 'mongoose';

/**
 * Script để setup Vector Search Index trên MongoDB Atlas
 * 
 * QUAN TRỌNG:
 * - Vector Search chỉ hoạt động trên MongoDB Atlas (M10+)
 * - KHÔNG hoạt động trên MongoDB local
 * - Cần tạo Search Index qua Atlas UI hoặc MongoDB CLI
 * 
 * Script này sẽ:
 * 1. Check connection tới Atlas
 * 2. Verify embeddings exist
 * 3. Provide instructions để tạo index
 */

async function checkAtlasConnection() {
  try {
    console.log('═══════════════════════════════════════════════════════════════════════');
    console.log('🔍 MONGODB ATLAS VECTOR SEARCH SETUP');
    console.log('═══════════════════════════════════════════════════════════════════════\n');

    // Connect
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(' Connected to MongoDB Atlas\n');

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    console.log('📊 Database:', db.databaseName);
    console.log('📦 Collections:', collections.map(c => c.name).join(', '));
    console.log('');

    return db;
  } catch (error) {
    console.error(' Connection error:', error.message);
    throw error;
  }
}

async function verifyEmbeddings(db) {
  try {
    console.log('═══════════════════════════════════════════════════════════════════════');
    console.log('🔍 VERIFYING EMBEDDINGS');
    console.log('═══════════════════════════════════════════════════════════════════════\n');

    const productsCollection = db.collection('products');

    // Count total products
    const totalProducts = await productsCollection.countDocuments();
    console.log(`📦 Total products: ${totalProducts}`);

    // Count products với recommendation embeddings
    const withRecommendationEmbedding = await productsCollection.countDocuments({
      embedding: { $exists: true, $ne: null, $type: 'array' }
    });
    console.log(` Products with recommendation embeddings: ${withRecommendationEmbedding}/${totalProducts}`);

    // Count products với RAG embeddings
    const withRagEmbedding = await productsCollection.countDocuments({
      rag_embedding: { $exists: true, $ne: null, $type: 'array' }
    });
    console.log(` Products with RAG embeddings: ${withRagEmbedding}/${totalProducts}`);

    // Count products với document chunks
    const withChunks = await productsCollection.countDocuments({
      document_chunks: { $exists: true, $ne: null, $not: { $size: 0 } }
    });
    console.log(` Products with document chunks: ${withChunks}/${totalProducts}`);

    // Get sample embedding to verify dimensions
    const sampleProduct = await productsCollection.findOne({
      embedding: { $exists: true }
    });

    if (sampleProduct?.embedding) {
      console.log(`\n📏 Embedding dimensions: ${sampleProduct.embedding.length}`);
      console.log(` Embeddings ready for Vector Search!\n`);
      return true;
    } else {
      console.log('\n⚠️ No embeddings found! Run generateRecommendationEmbeddings.js first.\n');
      return false;
    }

  } catch (error) {
    console.error(' Error verifying embeddings:', error);
    return false;
  }
}

function printIndexInstructions() {
  console.log('═══════════════════════════════════════════════════════════════════════');
  console.log('📋 HOW TO CREATE VECTOR SEARCH INDEX');
  console.log('═══════════════════════════════════════════════════════════════════════\n');

  console.log('🌐 METHOD 1: MongoDB Atlas UI (Recommended - Easiest)');
  console.log('─────────────────────────────────────────────────────────────────────\n');
  console.log('1. Vào MongoDB Atlas: https://cloud.mongodb.com');
  console.log('2. Chọn Cluster: ProjectLaptopCluster0');
  console.log('3. Vào tab "Search" → Click "Create Search Index"');
  console.log('4. Chọn "JSON Editor"');
  console.log('5. Chọn database: "root_laptops", collection: "products"');
  console.log('6. Dán JSON config sau:\n');

  const indexConfig1 = {
    name: "vector_recommendation_index",
    type: "vectorSearch",
    definition: {
      fields: [
        {
          type: "vector",
          path: "embedding",
          numDimensions: 384,
          similarity: "cosine"
        }
      ]
    }
  };

  console.log(JSON.stringify(indexConfig1, null, 2));
  console.log('\n7. Click "Create Search Index"\n');

  console.log('📝 Tạo thêm index cho RAG (nếu cần chatbot):\n');

  const indexConfig2 = {
    name: "vector_rag_summary_index",
    type: "vectorSearch",
    definition: {
      fields: [
        {
          type: "vector",
          path: "rag_embedding",
          numDimensions: 384,
          similarity: "cosine"
        }
      ]
    }
  };

  console.log(JSON.stringify(indexConfig2, null, 2));

  const indexConfig3 = {
    name: "vector_rag_chunks_index",
    type: "vectorSearch",
    definition: {
      fields: [
        {
          type: "vector",
          path: "document_chunks.embedding",
          numDimensions: 384,
          similarity: "cosine"
        }
      ]
    }
  };

  console.log('\n');
  console.log(JSON.stringify(indexConfig3, null, 2));
  console.log('\n');

  console.log('🖥️  METHOD 2: MongoDB CLI (Advanced)');
  console.log('─────────────────────────────────────────────────────────────────────\n');
  console.log('1. Install Atlas CLI: npm install -g atlas-cli');
  console.log('2. Login: atlas auth login');
  console.log('3. Create index: atlas clusters search indexes create');
  console.log('');

  console.log('⏱️  Thời gian tạo index: 2-5 phút');
  console.log('📊 Index size: ~2-5 MB (cho 196 products)');
  console.log('');

  console.log('═══════════════════════════════════════════════════════════════════════');
  console.log(' AFTER INDEX IS CREATED');
  console.log('═══════════════════════════════════════════════════════════════════════\n');
  console.log('1. Verify index: node src/scripts/testVectorSearch.js');
  console.log('2. Update recommendationService.js to use $vectorSearch');
  console.log('3. Test performance: node src/scripts/compareVectorSearchPerformance.js');
  console.log('');
}

async function checkExistingIndexes(db) {
  try {
    console.log('═══════════════════════════════════════════════════════════════════════');
    console.log('🔍 CHECKING EXISTING INDEXES');
    console.log('═══════════════════════════════════════════════════════════════════════\n');

    const productsCollection = db.collection('products');
    const indexes = await productsCollection.indexes();

    console.log('📋 Current indexes on products collection:\n');
    indexes.forEach((index, i) => {
      console.log(`${i + 1}. ${index.name}`);
      console.log(`   Keys:`, JSON.stringify(index.key));
      if (index.vectorSearchDefinition) {
        console.log(`   🎯 Vector Search Index!`);
        console.log(`   Definition:`, JSON.stringify(index.vectorSearchDefinition, null, 2));
      }
      console.log('');
    });

    // Check for Atlas Search indexes (requires Atlas Admin API)
    console.log('⚠️ Note: Vector Search indexes không hiển thị qua MongoDB driver');
    console.log('   Cần check qua Atlas UI: Search tab → View indexes');
    console.log('');

    return indexes;

  } catch (error) {
    console.error(' Error checking indexes:', error);
    return [];
  }
}

async function main() {
  try {
    const db = await checkAtlasConnection();
    const hasEmbeddings = await verifyEmbeddings(db);

    if (!hasEmbeddings) {
      console.log('⚠️ Please generate embeddings first:');
      console.log('   node src/scripts/generateRecommendationEmbeddings.js');
      console.log('   node src/scripts/generateRagEmbeddings.js');
      console.log('');
      return;
    }

    await checkExistingIndexes(db);
    printIndexInstructions();
  } catch (error) {
    console.error(' Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

main();
