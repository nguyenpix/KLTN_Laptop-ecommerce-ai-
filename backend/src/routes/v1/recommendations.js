// routes/recommendations.js
import express from 'express';
import { getContentBasedCandidates, getCollaborativeScores } from '../utils/recommendUtils.js';
import Product from '../models/Product.js';
const router = express.Router();

router.get('/hybrid/:userId', async (req, res) => {
  try {
    const candidates = await getContentBasedCandidates(req.params.userId, 20);
    if (candidates.length === 0) {
      const popular = await Product.find().sort({ 'specifications.views': -1 }).limit(20);
      return res.json(popular);
    }

    const collaborativeScores = await getCollaborativeScores(req.params.userId, candidates);

    const ranked = candidates
      .map(cand => ({
        ...cand,
        hybridScore: cand.score + (collaborativeScores[cand._id.toString()] || 0)
      }))
      .sort((a, b) => b.hybridScore - a.hybridScore)
      .slice(0, 20);

    res.json(ranked);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;