import mongoose from 'mongoose';
import dotenv from 'dotenv';
import embeddingService from '../services/embeddingService.js';
import Product from '../models/Product.js';

dotenv.config();

async function debugRagSearch() {
  try {
    console.log('🔌 Connecting to MongoDB...\n');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Test query
    const testQuery = 'laptop gaming giá dưới 25 triệu';
    console.log(`📝 Test query: "${testQuery}"\n`);

    // Generate embedding
    console.log('🔍 Generating query embedding...');
    const queryEmbedding = await embeddingService.createEmbedding(testQuery);
    console.log(`✅ Query embedding: ${queryEmbedding.length} dimensions\n`);

    // Check products with embeddings
    const totalProducts = await Product.countDocuments();
    const productsWithRagEmbedding = await Product.countDocuments({
      rag_embedding: { $exists: true, $ne: null }
    });
    const productsInStock = await Product.countDocuments({
      stock_quantity: { $gt: 0 }
    });
    const productsWithPrice = await Product.countDocuments({
      price: { $exists: true, $gt: 0 }
    });

    console.log('📊 DATABASE STATUS:');
    console.log(`   Total products: ${totalProducts}`);
    console.log(`   With rag_embedding: ${productsWithRagEmbedding}`);
    console.log(`   In stock: ${productsInStock}`);
    console.log(`   With price: ${productsWithPrice}\n`);

    // Test với nhiều thresholds
    console.log('🧪 TESTING DIFFERENT THRESHOLDS:\n');

    const thresholds = [0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3];

    for (const threshold of thresholds) {
      const pipeline = [
        {
          $match: {
            rag_embedding: { $exists: true, $ne: null }
            // Bỏ stock filter cho debug
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
                in: '$$dotProduct'
              }
            }
          }
        },
        {
          $match: {
            similarity: { $gte: threshold }
          }
        },
        {
          $sort: { similarity: -1 }
        },
        {
          $limit: 5
        },
        {
          $project: {
            name: 1,
            price: 1,
            similarity: 1,
            stock_quantity: 1
          }
        }
      ];

      const results = await Product.aggregate(pipeline);

      console.log(`Threshold ${threshold.toFixed(1)}: Found ${results.length} products`);
      
      if (results.length > 0) {
        results.forEach((product, idx) => {
          console.log(
            `   ${idx + 1}. ${product.name} - ${product.price.toLocaleString('vi-VN')}đ (${(
              product.similarity * 100
            ).toFixed(1)}%)`
          );
        });
      }
      console.log();
    }

    // Sample một vài products để xem data
    console.log('📦 SAMPLE PRODUCTS:\n');
    const sampleProducts = await Product.find()
      .limit(5)
      .select('name price specifications.cpu specifications.gpu rag_embedding stock_quantity');

    sampleProducts.forEach((product, idx) => {
      console.log(`${idx + 1}. ${product.name}`);
      console.log(`   Price: ${product.price.toLocaleString('vi-VN')}đ`);
      console.log(`   Stock: ${product.stock_quantity || 0}`);
      console.log(`   CPU: ${product.specifications?.cpu || 'N/A'}`);
      console.log(`   GPU: ${product.specifications?.gpu || 'N/A'}`);
      console.log(`   Has rag_embedding: ${product.rag_embedding ? 'Yes' : 'No'}`);
      console.log();
    });

    // Test similarity với 1 product cụ thể
    console.log('🔬 DETAILED SIMILARITY TEST:\n');
    const oneProduct = await Product.findOne({
      rag_embedding: { $exists: true }
    });

    if (oneProduct && oneProduct.rag_embedding) {
      // Tính cosine similarity thủ công
      let dotProduct = 0;
      for (let i = 0; i < 384; i++) {
        dotProduct += queryEmbedding[i] * oneProduct.rag_embedding[i];
      }

      console.log(`Product: ${oneProduct.name}`);
      console.log(`Price: ${oneProduct.price.toLocaleString('vi-VN')}đ`);
      console.log(`Cosine Similarity: ${(dotProduct * 100).toFixed(2)}%`);
      console.log(
        `Query embedding sample: [${queryEmbedding.slice(0, 5).map((v) => v.toFixed(4)).join(', ')}...]`
      );
      console.log(
        `Product embedding sample: [${oneProduct.rag_embedding.slice(0, 5).map((v) => v.toFixed(4)).join(', ')}...]`
      );
    }

    console.log('\n✅ Debug completed!');
  } catch (error) {
    console.error('\n❌ Error:', error);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB\n');
  }
}

debugRagSearch();
