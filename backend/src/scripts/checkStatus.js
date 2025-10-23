import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';
import User from '../models/User.js';
import UserRecommendationProfile from '../models/UserProfile.js';
import Interaction from '../models/Interaction.js';

dotenv.config();

async function checkStatus() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(' Connected to MongoDB\n');

    // PRODUCTS
    console.log('📦 PRODUCTS:');
    const totalProducts = await Product.countDocuments();
    const withEmbeddings = await Product.countDocuments({ 
      embedding: { $exists: true, $ne: null } 
    });
    const withStock = await Product.countDocuments({ stock: { $gt: 0 } });
    const withBoth = await Product.countDocuments({ 
      embedding: { $exists: true, $ne: null },
      stock: { $gt: 0 }
    });

    console.log(`   Total products: ${totalProducts}`);
    console.log(`   With embeddings: ${withEmbeddings}`);
    console.log(`   With stock > 0: ${withStock}`);
    console.log(`   With both: ${withBoth}`);

    // USERS
    console.log('\n👤 USERS:');
    const totalUsers = await User.countDocuments();
    const totalProfiles = await UserRecommendationProfile.countDocuments();
    const profilesWithEmbedding = await UserRecommendationProfile.countDocuments({ 
      user_embedding: { $exists: true, $ne: null } 
    });

    console.log(`   Total users: ${totalUsers}`);
    console.log(`   Total profiles: ${totalProfiles}`);
    console.log(`   Profiles with embedding: ${profilesWithEmbedding}`);

    // INTERACTIONS
    console.log('\n🔄 INTERACTIONS:');
    const totalInteractions = await Interaction.countDocuments();
    const byType = await Interaction.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    console.log(`   Total interactions: ${totalInteractions}`);
    byType.forEach(item => {
      console.log(`   - ${item._id}: ${item.count}`);
    });

    // Sample data
    if (withEmbeddings > 0) {
      console.log('\n📊 SAMPLE PRODUCT WITH EMBEDDING:');
      const sample = await Product.findOne({ embedding: { $exists: true } })
        .select('name embedding')
        .lean();
      console.log(`   Name: ${sample.name}`);
      console.log(`   Embedding dims: ${sample.embedding?.length || 0}`);
    }

    if (profilesWithEmbedding > 0) {
      console.log('\n📊 SAMPLE USER PROFILE WITH EMBEDDING:');
      const sampleProfile = await UserRecommendationProfile.findOne({ 
        user_embedding: { $exists: true } 
      }).lean();
      console.log(`   User ID: ${sampleProfile.userId}`);
      console.log(`   Embedding dims: ${sampleProfile.user_embedding?.length || 0}`);
      console.log(`   Quality: ${sampleProfile.embedding_metadata?.quality || 'N/A'}`);
    }

    // VECTOR INDEX
    console.log('\n🔍 VECTOR SEARCH INDEX:');
    try {
      const collections = await mongoose.connection.db.listCollections({ name: 'products' }).toArray();
      if (collections.length > 0) {
        const indexes = await Product.collection.indexes();
        const vectorIndex = indexes.find(idx => idx.name === 'vector_index');
        if (vectorIndex) {
          console.log('    Vector index exists');
        } else {
          console.log('   ⚠️  Vector index NOT found');
          console.log('   Run: node src/scripts/setupVectorSearchIndex.js');
        }
      }
    } catch (error) {
      console.log('   ⚠️  Could not check vector index:', error.message);
    }

    // RECOMMENDATIONS
    console.log('\n🎯 RECOMMENDATION SYSTEM STATUS:');
    const ready = withBoth > 0 && totalInteractions > 0;
    if (ready) {
      console.log('    READY TO USE');
      console.log('   - Products with embeddings: OK');
      console.log('   - User interactions: OK');
      console.log('   - Can generate recommendations!');
    } else {
      console.log('   ⚠️  NOT READY');
      if (withBoth === 0) {
        console.log('   - Need to generate product embeddings');
        console.log('     Run: node src/scripts/generateRecommendationEmbeddings.js');
      }
      if (totalInteractions === 0) {
        console.log('   - No user interactions yet');
        console.log('     Users need to interact with products first');
      }
    }

  } catch (error) {
    console.error(' Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected');
  }
}

checkStatus();
