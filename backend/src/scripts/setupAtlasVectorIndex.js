import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function createVectorIndex() {
  console.log('🔗 Connecting to MongoDB Atlas...');
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    const collection = db.collection('products');

    console.log('🛠️ Attempting to create Atlas Vector Search Index via MongoDB Driver...');

    const indexDefinition = {
      name: 'vector_index',
      type: 'vectorSearch',
      definition: {
        fields: [
          {
            type: 'vector',
            path: 'item_content_vector',
            numDimensions: 384,
            similarity: 'cosine'
          }
        ]
      }
    };

    if (typeof collection.createSearchIndex === 'function') {
      const result = await collection.createSearchIndex(indexDefinition);
      console.log('✅ Successfully initiated Vector Search Index creation:', result);
    } else {
      console.log('ℹ️ createSearchIndex is not supported on this driver version, using Atlas UI is recommended.');
    }

  } catch (error) {
    console.log('ℹ️ Automatic creation notice:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

createVectorIndex();
