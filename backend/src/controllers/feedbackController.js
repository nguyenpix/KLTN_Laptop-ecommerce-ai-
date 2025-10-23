import Feedback from '../models/Feedback.js';
import Product from '../models/Product.js';

// Get all feedbacks for a specific product
export const getProductFeedbacks = async (req, res) => {
    try {
        const { productId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Check if product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        const feedbacks = await Feedback.find({ product_id: productId })
            .populate('user_id', 'username email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Feedback.countDocuments({ product_id: productId });

        // Calculate average rating
        const ratingStats = await Feedback.aggregate([
            { $match: { product_id: product._id } },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: '$rating' },
                    totalFeedbacks: { $sum: 1 }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                feedbacks,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                },
                stats: ratingStats.length > 0 ? {
                    averageRating: ratingStats[0].averageRating.toFixed(1),
                    totalFeedbacks: ratingStats[0].totalFeedbacks
                } : {
                    averageRating: 0,
                    totalFeedbacks: 0
                }
            }
        });
    } catch (error) {
        console.error('Error getting product feedbacks:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting product feedbacks',
            error: error.message
        });
    }
};

// Create a new feedback
export const createFeedback = async (req, res) => {
    try {
        const { product_id, rating, comment, wishlist } = req.body;
        const user_id = req.user.userId;

        // Validate required fields
        if (!product_id || !rating || !comment) {
            return res.status(400).json({
                success: false,
                message: 'Product ID, rating, and comment are required'
            });
        }

        // Validate rating range
        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be between 1 and 5'
            });
        }

        // Check if product exists
        const product = await Product.findById(product_id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Check if user already reviewed this product
        const existingFeedback = await Feedback.findOne({
            user_id,
            product_id
        });

        if (existingFeedback) {
            return res.status(400).json({
                success: false,
                message: 'You have already reviewed this product'
            });
        }

        // Create new feedback
        const feedback = new Feedback({
            user_id,
            product_id,
            rating,
            comment,
            wishlist: wishlist || false
        });

        await feedback.save();

        // Populate user info before sending response
        await feedback.populate('user_id', 'username email');

        res.status(201).json({
            success: true,
            message: 'Feedback created successfully',
            data: feedback
        });
    } catch (error) {
        console.error('Error creating feedback:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating feedback',
            error: error.message
        });
    }
};

// Update feedback
export const updateFeedback = async (req, res) => {
    try {
        const { feedbackId } = req.params;
        const { rating, comment, wishlist } = req.body;
        const user_id = req.user.userId;

        // Find feedback
        const feedback = await Feedback.findById(feedbackId);

        if (!feedback) {
            return res.status(404).json({
                success: false,
                message: 'Feedback not found'
            });
        }

        // Check if user owns this feedback
        if (feedback.user_id.toString() !== user_id) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to update this feedback'
            });
        }

        // Update fields
        if (rating !== undefined) {
            if (rating < 1 || rating > 5) {
                return res.status(400).json({
                    success: false,
                    message: 'Rating must be between 1 and 5'
                });
            }
            feedback.rating = rating;
        }
        if (comment !== undefined) feedback.comment = comment;
        if (wishlist !== undefined) feedback.wishlist = wishlist;

        await feedback.save();
        await feedback.populate('user_id', 'username email');

        res.status(200).json({
            success: true,
            message: 'Feedback updated successfully',
            data: feedback
        });
    } catch (error) {
        console.error('Error updating feedback:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating feedback',
            error: error.message
        });
    }
};

// Delete feedback
export const deleteFeedback = async (req, res) => {
    try {
        const { feedbackId } = req.params;
        const user_id = req.user.userId;

        // Find feedback
        const feedback = await Feedback.findById(feedbackId);

        if (!feedback) {
            return res.status(404).json({
                success: false,
                message: 'Feedback not found'
            });
        }

        // Check if user owns this feedback
        if (feedback.user_id.toString() !== user_id) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to delete this feedback'
            });
        }

        await Feedback.findByIdAndDelete(feedbackId);

        res.status(200).json({
            success: true,
            message: 'Feedback deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting feedback:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting feedback',
            error: error.message
        });
    }
};

// Get all feedbacks by current user
export const getUserFeedbacks = async (req, res) => {
    try {
        const user_id = req.user.userId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const feedbacks = await Feedback.find({ user_id })
            .populate('product_id', 'name price images')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Feedback.countDocuments({ user_id });

        res.status(200).json({
            success: true,
            data: {
                feedbacks,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Error getting user feedbacks:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting user feedbacks',
            error: error.message
        });
    }
};

// Get wishlist from feedbacks (products marked as wishlist)
export const getWishlistFromFeedbacks = async (req, res) => {
    try {
        const user_id = req.user.userId;

        const wishlistFeedbacks = await Feedback.find({
            user_id,
            wishlist: true
        })
            .populate('product_id', 'name price images brand specifications')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: {
                wishlist: wishlistFeedbacks,
                count: wishlistFeedbacks.length
            }
        });
    } catch (error) {
        console.error('Error getting wishlist:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting wishlist',
            error: error.message
        });
    }
};

// Toggle wishlist status for a feedback
export const toggleWishlist = async (req, res) => {
    try {
        const { feedbackId } = req.params;
        const user_id = req.user.userId;

        // Find feedback
        const feedback = await Feedback.findById(feedbackId);

        if (!feedback) {
            return res.status(404).json({
                success: false,
                message: 'Feedback not found'
            });
        }

        // Check if user owns this feedback
        if (feedback.user_id.toString() !== user_id) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to update this feedback'
            });
        }

        // Toggle wishlist
        feedback.wishlist = !feedback.wishlist;
        await feedback.save();

        res.status(200).json({
            success: true,
            message: `Product ${feedback.wishlist ? 'added to' : 'removed from'} wishlist`,
            data: {
                feedbackId: feedback._id,
                wishlist: feedback.wishlist
            }
        });
    } catch (error) {
        console.error('Error toggling wishlist:', error);
        res.status(500).json({
            success: false,
            message: 'Error toggling wishlist',
            error: error.message
        });
    }
};

export default {
    getProductFeedbacks,
    createFeedback,
    updateFeedback,
    deleteFeedback,
    getUserFeedbacks,
    getWishlistFromFeedbacks,
    toggleWishlist
};
