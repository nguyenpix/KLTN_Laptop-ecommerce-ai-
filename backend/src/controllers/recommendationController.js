import recommendationService from '../services/recommendationService.js';

const recommendationController = {
  // Main recommendation endpoint
  getRecommendations: async (req, res) => {
    try {
      const userId = req.user.id;
      const { limit = 20, type = 'hybrid' } = req.query;

      const recommendations = await recommendationService.getRecommendations(userId, {
        finalLimit: parseInt(limit)
      });

      res.json({
        success: true,
        data: {
          recommendations,
          algorithm: 'sequential_hybrid',
          user_id: userId,
          generated_at: new Date()
        }
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Lỗi khi tạo gợi ý sản phẩm',
        error: error.message
      });
    }
  }
};

export default recommendationController;