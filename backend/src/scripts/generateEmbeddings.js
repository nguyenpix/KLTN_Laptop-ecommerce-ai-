// scripts/generateEmbeddings.js
import mongoose from 'mongoose';
import { pipeline } from '@xenova/transformers';
import { htmlToText } from 'html-to-text';
import { word_tokenize } from 'underthesea';
import Product from '../models/Product.js';
import fs from 'fs';

// Tóm tắt text dài
async function summarizeText(text) {
  try {
    const summarizer = await pipeline('summarization', 'facebook/bart-large-cnn');
    const result = await summarizer(text, { max_length: 150, min_length: 50 });
    return result[0].summary_text;
  } catch (error) {
    fs.appendFileSync('error.log', `${new Date().toISOString()}: Summarization error: ${error.message}\n`);
    return text.substring(0, 500); // Fallback
  }
}

// Trích xuất từ khóa tiếng Việt
async function extractKeywords(text) {
  try {
    const tokens = word_tokenize(text); // Tokenization tiếng Việt
    return tokens.filter(t => t.length > 2).join(' ');
  } catch (error) {
    fs.appendFileSync('error.log', `${new Date().toISOString()}: Keyword extraction error: ${error.message}\n`);
    return text.substring(0, 200);
  }
}

// Tạo embedding bằng PhoBERT
async function createEmbedding(text) {
  try {
    const embedder = await pipeline('feature-extraction', 'vinai/phobert-base');
    const result = await embedder(text, { pooling: 'mean', normalize: true });
    return Array.from(result.data); // Vector 768 chiều
  } catch (error) {
    fs.appendFileSync('error.log', `${new Date().toISOString()}: Embedding error: ${error.message}\n`);
    return null;
  }
}

// Script chính
async function generateEmbeddings() {
  await mongoose.connect('mongodb://your-atlas-uri');
  try {
    const products = await Product.find().populate('category_id brand');
    let processed = 0;

    for (const product of products) {
      // Chuyển HTML thành text sạch
      const cleanText = htmlToText(product.description, { wordwrap: false, ignoreHref: true, ignoreImage: true });
      const noAdsText = cleanText.replace(/Đặt hàng ngay.*$/g, '').replace(/bảo hành.*$/gi, '');

      // Tóm tắt nếu quá dài (>512 token ~ 1000 ký tự)
      let descriptionClean = noAdsText;
      if (noAdsText.length > 1000) {
        descriptionClean = await summarizeText(noAdsText);
      }

      // Trích xuất từ khóa
      const keywords = await extractKeywords(descriptionClean);

      // Kết hợp dữ liệu
      const specs = `${product.specifications.cpu} ${product.specifications.gpu} ${product.specifications.ram} ${product.specifications.display}`;
      const text = `${product.title} ${keywords} ${descriptionClean} ${specs} ${product.category_id.map(c => c.name).join(', ')} ${product.brand?.name || ''}`;

      // Tạo embedding
      const embedding = await createEmbedding(text);
      if (embedding) {
        await Product.updateOne(
          { _id: product._id },
          { $set: { embedding, description_clean: descriptionClean } }
        );
        console.log(`Updated embedding for product: ${product.title}`);
      }

      processed++;
      console.log(`Processed ${processed}/400`);
    }
    console.log('Embedding generation completed');
  } catch (error) {
    fs.appendFileSync('error.log', `${new Date().toISOString()}: Error: ${error.message}\n`);
  } finally {
    await mongoose.connection.close();
  }
}

generateEmbeddings();