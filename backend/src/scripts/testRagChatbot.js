import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import chatbotService from '../services/chatbotService.js';
import User from '../models/User.js';

dotenv.config();

async function testRagChatbot() {
  try {
    console.log('🔌 Connecting to MongoDB...\n');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    console.log('='.repeat(70));
    console.log('🤖 RAG CHATBOT TEST');
    console.log('='.repeat(70));

    // Find or create test user
    let testUser = await User.findOne({ email: 'test@example.com' });

    if (!testUser) {
      console.log('\n⚠️  Test user not found. Creating...');
      const hashedPassword = await bcrypt.hash('test123456', 10);
      testUser = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password_hash: hashedPassword,
        role: 'user'
      });
      console.log('✅ Test user created');
    }

    console.log(`\n👤 Using test user: ${testUser.name} (${testUser.email})`);

    // Create new conversation
    console.log('\n📝 Creating new conversation...');
    const conversation = await chatbotService.createConversation(
      testUser._id,
      'Test RAG Chatbot'
    );
    console.log(`✅ Conversation created: ${conversation._id}`);

    // Test queries
    const testQueries = [
      'Tôi cần laptop gaming giá dưới 25 triệu',
      'So sánh Acer Predator và MSI Katana',
      'Laptop nào có RTX 4050?',
      'Tư vấn laptop cho lập trình viên'
    ];

    console.log('\n' + '='.repeat(70));
    console.log('🧪 RUNNING TEST QUERIES');
    console.log('='.repeat(70));

    for (let i = 0; i < testQueries.length; i++) {
      const query = testQueries[i];

      console.log(`\n\n[${'#'.repeat(3)} TEST ${i + 1}/${ testQueries.length} ${'#'.repeat(3)}]`);
      console.log(`\n💬 User: "${query}"\n`);

      const result = await chatbotService.chat(conversation._id, query);

      console.log(`\n🤖 Assistant:`);
      console.log('-'.repeat(70));
      console.log(result.message.content);
      console.log('-'.repeat(70));

      if (result.products && result.products.length > 0) {
        console.log(`\n📦 Referenced Products (${result.products.length}):`);
        result.products.forEach((product, idx) => {
          console.log(
            `   ${idx + 1}. ${product.name} - ${product.price.toLocaleString('vi-VN')}đ (${(
              (product.similarity || 0) * 100
            ).toFixed(1)}%)`
          );
        });
      }

      console.log(`\n⏱️  Performance:`);
      console.log(`   - Total time: ${result.total_time_ms}ms`);
      console.log(
        `   - RAG search: ${result.message.metadata.rag_results.search_time_ms}ms`
      );
      console.log(
        `   - LLM generation: ${result.message.metadata.llm_metadata.generation_time_ms}ms`
      );
      console.log(`   - Chunks used: ${result.message.metadata.rag_results.total_chunks}`);

      // Wait a bit between requests
      if (i < testQueries.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }
    // Show conversation summary
    const conversationDetail = await chatbotService.getConversationDetail(
      conversation._id,
      testUser._id
    );

  

  } catch (error) {
 
  } finally {
    await mongoose.disconnect();
  }
}
// Run test
testRagChatbot();
