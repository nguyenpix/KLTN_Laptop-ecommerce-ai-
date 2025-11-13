// import { AIService } from '../services/aiService.js';

// // Lấy gợi ý từ AI
// export const getRecommendations = async (req, res) => {
//   try {
//     const { budget, usage, brand, cpu, ram, storage } = req.query;
//     const limit = parseInt(req.query.limit) || 5;

//     const userPreferences = {
//       budget,
//       usage,
//       brand,
//       cpu,
//       ram,
//       storage
//     };

//     const recommendations = await AIService.getRecommendations(userPreferences, limit);

//     res.json({
//       success: true,
//       data: recommendations,
//       preferences: userPreferences
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Error generating recommendations',
//       error: error.message
//     });
//   }
// };

// // Tạo mô tả sản phẩm bằng AI
// export const generateDescription = async (req, res) => {
//   try {
//     const productData = req.body;

//     const description = await AIService.generateProductDescription(productData);

//     res.json({
//       success: true,
//       data: {
//         description
//       }
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Error generating description',
//       error: error.message
//     });
//   }
// };

// // Trả lời câu hỏi về sản phẩm
// export const answerQuestion = async (req, res) => {
//   try {
//     const { productId } = req.params;
//     const { question } = req.body;

//     if (!question) {
//       return res.status(400).json({
//         success: false,
//         message: 'Question is required'
//       });
//     }

//     const answer = await AIService.answerProductQuestion(question, productId);

//     res.json({
//       success: true,
//       data: {
//         question,
//         answer,
//         productId
//       }
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Error answering question',
//       error: error.message
//     });
//   }
// };
