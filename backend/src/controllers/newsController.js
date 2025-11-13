import News from '../models/News.js';
import mongoose from 'mongoose';

// Helper function to generate slug from title
const generateSlug = (title) => {
    return title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
        .trim();
};

// Get all news with pagination
export const getAllNews = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const sortBy = req.query.sortBy || 'createdAt';
        const order = req.query.order === 'asc' ? 1 : -1;

        const query = {};

        // Search by title or content
        if (req.query.search) {
            query.$or = [
                { title: { $regex: req.query.search, $options: 'i' } },
                { content: { $regex: req.query.search, $options: 'i' } }
            ];
        }

        const news = await News.find(query)
            .populate('author_id', 'username email')
            .sort({ [sortBy]: order })
            .skip(skip)
            .limit(limit);

        const total = await News.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                news,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Error getting all news:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting news',
            error: error.message
        });
    }
};

// Get single news by ID or slug
export const getNewsById = async (req, res) => {
    try {
        const { newsId } = req.params;

        let news;
        // Check if newsId is a valid ObjectId or slug
        if (mongoose.Types.ObjectId.isValid(newsId)) {
            news = await News.findById(newsId)
                .populate('author_id', 'username email');
        } else {
            news = await News.findOne({ slug: newsId })
                .populate('author_id', 'username email');
        }

        if (!news) {
            return res.status(404).json({
                success: false,
                message: 'News not found'
            });
        }

        res.status(200).json({
            success: true,
            data: news
        });
    } catch (error) {
        console.error('Error getting news by ID:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting news',
            error: error.message
        });
    }
};

// Get news by category (if you have category relationship)
export const getNewsByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Note: This assumes you have a category field in News model
        // If not, you might need to adjust based on your actual schema
        const news = await News.find({ category_id: categoryId })
            .populate('author_id', 'username email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await News.countDocuments({ category_id: categoryId });

        res.status(200).json({
            success: true,
            data: {
                news,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Error getting news by category:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting news by category',
            error: error.message
        });
    }
};

// Create new news (Admin only)
export const createNews = async (req, res) => {
    try {
        const { title, content, thumbnail_img, category_id } = req.body;
        const author_id = req.user.userId;

        // Validate required fields
        if (!title || !content || !thumbnail_img) {
            return res.status(400).json({
                success: false,
                message: 'Title, content, and thumbnail image are required'
            });
        }

        // Generate slug from title
        let slug = generateSlug(title);

        // Check if slug already exists and make it unique
        let slugExists = await News.findOne({ slug });
        let counter = 1;
        const originalSlug = slug;
        while (slugExists) {
            slug = `${originalSlug}-${counter}`;
            slugExists = await News.findOne({ slug });
            counter++;
        }

        // Create news
        const news = new News({
            title,
            slug,
            content,
            thumbnail_img,
            author_id,
            ...(category_id && { category_id })
        });

        await news.save();
        await news.populate('author_id', 'username email');

        res.status(201).json({
            success: true,
            message: 'News created successfully',
            data: news
        });
    } catch (error) {
        console.error('Error creating news:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating news',
            error: error.message
        });
    }
};

// Update news (Admin only)
export const updateNews = async (req, res) => {
    try {
        const { newsId } = req.params;
        const { title, content, thumbnail_img, category_id } = req.body;

        // Find news
        const news = await News.findById(newsId);

        if (!news) {
            return res.status(404).json({
                success: false,
                message: 'News not found'
            });
        }

        // Update fields
        if (title) {
            news.title = title;
            // Regenerate slug if title changed
            let slug = generateSlug(title);
            
            // Check if slug already exists (excluding current news)
            let slugExists = await News.findOne({ slug, _id: { $ne: newsId } });
            let counter = 1;
            const originalSlug = slug;
            while (slugExists) {
                slug = `${originalSlug}-${counter}`;
                slugExists = await News.findOne({ slug, _id: { $ne: newsId } });
                counter++;
            }
            news.slug = slug;
        }
        if (content !== undefined) news.content = content;
        if (thumbnail_img !== undefined) news.thumbnail_img = thumbnail_img;
        if (category_id !== undefined) news.category_id = category_id;

        await news.save();
        await news.populate('author_id', 'username email');

        res.status(200).json({
            success: true,
            message: 'News updated successfully',
            data: news
        });
    } catch (error) {
        console.error('Error updating news:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating news',
            error: error.message
        });
    }
};

// Delete news (Admin only)
export const deleteNews = async (req, res) => {
    try {
        const { newsId } = req.params;

        const news = await News.findByIdAndDelete(newsId);

        if (!news) {
            return res.status(404).json({
                success: false,
                message: 'News not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'News deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting news:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting news',
            error: error.message
        });
    }
};

// Track news view (for analytics/interaction tracking)
export const trackNewsView = async (req, res) => {
    try {
        const { newsId } = req.params;
        const userId = req.user.userId;

        // Check if news exists
        const news = await News.findById(newsId);
        if (!news) {
            return res.status(404).json({
                success: false,
                message: 'News not found'
            });
        }

        // Here you can implement view tracking logic
        // For example, using Interaction model or a separate NewsView model
        // This is a placeholder - adjust based on your interaction tracking system

        res.status(200).json({
            success: true,
            message: 'News view tracked successfully',
            data: {
                newsId,
                userId
            }
        });
    } catch (error) {
        console.error('Error tracking news view:', error);
        res.status(500).json({
            success: false,
            message: 'Error tracking news view',
            error: error.message
        });
    }
};

export default {
    getAllNews,
    getNewsById,
    getNewsByCategory,
    createNews,
    updateNews,
    deleteNews,
    trackNewsView
};
