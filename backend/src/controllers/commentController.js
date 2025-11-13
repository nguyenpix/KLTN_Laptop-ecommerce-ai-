import Comment from '../models/Comment.js';
import Product from '../models/Product.js';
import News from '../models/News.js';
import mongoose from 'mongoose';

// Get comments for a specific product
export const getProductComments = async (req, res) => {
    try {
        const { productId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        // Check if product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Get comments with pagination
        const comments = await Comment.find({ product_id: productId })
            .populate('user_id', 'username email avatar')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Comment.countDocuments({ product_id: productId });

        res.status(200).json({
            success: true,
            data: {
                comments,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Error getting product comments:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting product comments',
            error: error.message
        });
    }
};

// Get comments for a specific news article
export const getNewsComments = async (req, res) => {
    try {
        const { newsId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        // Check if news exists
        const news = await News.findById(newsId);
        if (!news) {
            return res.status(404).json({
                success: false,
                message: 'News not found'
            });
        }

        // Get comments with pagination
        // Note: Your Comment model only has product_id field
        // You might need to add news_id field to Comment model
        // For now, I'll return empty array or you can modify Comment schema
        const comments = await Comment.find({ news_id: newsId })
            .populate('user_id', 'username email avatar')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Comment.countDocuments({ news_id: newsId });

        res.status(200).json({
            success: true,
            data: {
                comments,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Error getting news comments:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting news comments',
            error: error.message
        });
    }
};

// Create a new comment
export const createComment = async (req, res) => {
    try {
        const { product_id, news_id, text } = req.body;
        const user_id = req.user.userId;

        // Validate that either product_id or news_id is provided
        if (!product_id && !news_id) {
            return res.status(400).json({
                success: false,
                message: 'Either product_id or news_id must be provided'
            });
        }

        // Validate text
        if (!text || text.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Comment text is required'
            });
        }

        // Check if referenced entity exists
        if (product_id) {
            const product = await Product.findById(product_id);
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: 'Product not found'
                });
            }
        }

        if (news_id) {
            const news = await News.findById(news_id);
            if (!news) {
                return res.status(404).json({
                    success: false,
                    message: 'News not found'
                });
            }
        }

        // Create comment
        const commentData = {
            user_id,
            text: text.trim(),
            time: new Date()
        };

        if (product_id) {
            commentData.product_id = product_id;
        }
        if (news_id) {
            commentData.news_id = news_id;
        }

        const comment = new Comment(commentData);
        await comment.save();

        // Populate user info before sending response
        await comment.populate('user_id', 'username email avatar');

        res.status(201).json({
            success: true,
            message: 'Comment created successfully',
            data: comment
        });
    } catch (error) {
        console.error('Error creating comment:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating comment',
            error: error.message
        });
    }
};

// Update a comment
export const updateComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const { text } = req.body;
        const user_id = req.user.userId;

        // Validate text
        if (!text || text.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Comment text is required'
            });
        }

        // Find comment
        const comment = await Comment.findById(commentId);

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }

        // Check if user owns this comment
        if (comment.user_id.toString() !== user_id) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to update this comment'
            });
        }

        // Update comment
        comment.text = text.trim();
        comment.time = new Date(); // Update timestamp
        await comment.save();

        await comment.populate('user_id', 'username email avatar');

        res.status(200).json({
            success: true,
            message: 'Comment updated successfully',
            data: comment
        });
    } catch (error) {
        console.error('Error updating comment:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating comment',
            error: error.message
        });
    }
};

// Delete a comment
export const deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const user_id = req.user.userId;

        // Find comment
        const comment = await Comment.findById(commentId);

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }

        // Check if user owns this comment
        if (comment.user_id.toString() !== user_id) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to delete this comment'
            });
        }

        await Comment.findByIdAndDelete(commentId);

        res.status(200).json({
            success: true,
            message: 'Comment deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting comment',
            error: error.message
        });
    }
};

// Toggle like on a comment
export const toggleLikeComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const user_id = req.user.userId;

        // Find comment
        const comment = await Comment.findById(commentId);

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }

        // Initialize likes array if it doesn't exist
        if (!comment.likes) {
            comment.likes = [];
        }

        // Check if user already liked this comment
        const likeIndex = comment.likes.indexOf(user_id);
        let isLiked;

        if (likeIndex > -1) {
            // Unlike - remove user from likes array
            comment.likes.splice(likeIndex, 1);
            isLiked = false;
        } else {
            // Like - add user to likes array
            comment.likes.push(user_id);
            isLiked = true;
        }

        await comment.save();

        res.status(200).json({
            success: true,
            message: isLiked ? 'Comment liked' : 'Comment unliked',
            data: {
                commentId: comment._id,
                isLiked,
                likesCount: comment.likes.length
            }
        });
    } catch (error) {
        console.error('Error toggling comment like:', error);
        res.status(500).json({
            success: false,
            message: 'Error toggling comment like',
            error: error.message
        });
    }
};

export default {
    getProductComments,
    getNewsComments,
    createComment,
    updateComment,
    deleteComment,
    toggleLikeComment
};
