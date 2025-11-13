// import OpenAI from 'openai';
// import Product from '../models/Product.js';

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY
// });

// export class AIService {
//   // Tạo gợi ý sản phẩm dựa trên sở thích người dùng
//   static async getRecommendations(userPreferences, limit = 5) {
//     try {
//       // Lấy tất cả sản phẩm với thông số kỹ thuật
//       const products = await Product.find()
//         .populate('brand_id', 'name')
//         .populate('category_id', 'name')
//         .populate('color_id', 'name');

//       const productsWithSpecs = await Promise.all(
//         products.map(async (product) => {
//           const specs = await ProductSpecification.findOne({ product_id: product._id });
//           return {
//             ...product.toObject(),
//             specifications: specs
//           };
//         })
//       );

//       // Tạo prompt cho AI
//       const prompt = this.createRecommendationPrompt(userPreferences, productsWithSpecs);

//       const completion = await openai.chat.completions.create({
//         model: "gpt-3.5-turbo",
//         messages: [
//           {
//             role: "system",
//             content: "You are a laptop expert assistant. Analyze user preferences and recommend the best laptops from the provided list. Return only the product IDs in order of preference."
//           },
//           {
//             role: "user",
//             content: prompt
//           }
//         ],
//         max_tokens: 500,
//         temperature: 0.7
//       });

//       const recommendations = this.parseRecommendations(completion.choices[0].message.content);
      
//       // Lấy các sản phẩm được gợi ý
//       const recommendedProducts = productsWithSpecs.filter(product => 
//         recommendations.includes(product._id.toString())
//       );

//       return recommendedProducts.slice(0, limit);
//     } catch (error) {
//       console.error('AI Recommendation Error:', error);
//       throw new Error('Failed to generate recommendations');
//     }
//   }

//   // Tạo mô tả sản phẩm bằng AI
//   static async generateProductDescription(productData) {
//     try {
//       const prompt = `Generate a compelling product description for a laptop with the following specifications:
      
//       Name: ${productData.name}
//       Brand: ${productData.brand}
//       CPU: ${productData.cpu}
//       RAM: ${productData.ram}
//       Storage: ${productData.storage}
//       Display: ${productData.display}
//       Graphics: ${productData.graphics}
//       Price: ${productData.price}
      
//       Create a marketing-focused description that highlights key features and benefits. Keep it engaging and informative.`;

//       const completion = await openai.chat.completions.create({
//         model: "gpt-3.5-turbo",
//         messages: [
//           {
//             role: "system",
//             content: "You are a professional product copywriter specializing in technology products."
//           },
//           {
//             role: "user",
//             content: prompt
//           }
//         ],
//         max_tokens: 800,
//         temperature: 0.8
//       });

//       return completion.choices[0].message.content;
//     } catch (error) {
//       console.error('AI Description Generation Error:', error);
//       throw new Error('Failed to generate product description');
//     }
//   }

//   // Trả lời câu hỏi về sản phẩm bằng AI
//   static async answerProductQuestion(question, productId) {
//     try {
//       const product = await Product.findById(productId)
//         .populate('brand_id', 'name')
//         .populate('category_id', 'name')
//         .populate('color_id', 'name');

//       if (!product) {
//         throw new Error('Product not found');
//       }

//       const specs = await ProductSpecification.findOne({ product_id: productId });

//       const prompt = `Answer this question about the laptop: "${question}"
      
//       Product Information:
//       Name: ${product.name}
//       Brand: ${product.brand_id?.name}
//       Description: ${product.description}
//       Price: ${product.price}
      
//       Specifications:
//       CPU: ${specs?.cpu || 'N/A'}
//       RAM: ${specs?.ram || 'N/A'}
//       Storage: ${specs?.storage || 'N/A'}
//       Display: ${specs?.display || 'N/A'}
//       Graphics: ${specs?.gpu || 'N/A'}
//       OS: ${specs?.os || 'N/A'}
//       Features: ${specs?.features || 'N/A'}
      
//       Provide a helpful and accurate answer based on the product information.`;

//       const completion = await openai.chat.completions.create({
//         model: "gpt-3.5-turbo",
//         messages: [
//           {
//             role: "system",
//             content: "You are a helpful laptop expert assistant. Answer questions about laptop products accurately and helpfully."
//           },
//           {
//             role: "user",
//             content: prompt
//           }
//         ],
//         max_tokens: 500,
//         temperature: 0.7
//       });

//       return completion.choices[0].message.content;
//     } catch (error) {
//       console.error('AI Question Answering Error:', error);
//       throw new Error('Failed to answer question');
//     }
//   }

//   // Tạo prompt gợi ý
//   static createRecommendationPrompt(userPreferences, products) {
//     const productsInfo = products.map(product => 
//       `ID: ${product._id}
//       Name: ${product.name}
//       Brand: ${product.brand_id?.name}
//       Price: ${product.price}
//       CPU: ${product.specifications?.cpu || 'N/A'}
//       RAM: ${product.specifications?.ram || 'N/A'}
//       Storage: ${product.specifications?.storage || 'N/A'}
//       Display: ${product.specifications?.display || 'N/A'}
//       Graphics: ${product.specifications?.gpu || 'N/A'}`
//     ).join('\n\n');

//     return `User Preferences:
//     Budget: ${userPreferences.budget || 'Any'}
//     Usage: ${userPreferences.usage || 'General'}
//     Brand Preference: ${userPreferences.brand || 'Any'}
//     CPU Preference: ${userPreferences.cpu || 'Any'}
//     RAM Requirement: ${userPreferences.ram || 'Any'}
//     Storage Requirement: ${userPreferences.storage || 'Any'}
    
//     Available Products:
//     ${productsInfo}
    
//     Based on the user preferences, recommend the best laptops from the list above. Return only the product IDs in order of preference, separated by commas.`;
//   }

//   // Phân tích gợi ý từ AI
//   static parseRecommendations(aiResponse) {
//     try {
//       // Trích xuất ID sản phẩm từ phản hồi AI
//       const lines = aiResponse.split('\n');
//       const recommendationLine = lines.find(line => 
//         line.includes('ID:') || line.match(/^[a-f\d]{24}(,\s*[a-f\d]{24})*$/i)
//       );
      
//       if (recommendationLine) {
//         return recommendationLine
//           .split(',')
//           .map(id => id.trim())
//           .filter(id => id.match(/^[a-f\d]{24}$/i));
//       }
      
//       return [];
//     } catch (error) {
//       console.error('Error parsing recommendations:', error);
//       return [];
//     }
//   }
// }
