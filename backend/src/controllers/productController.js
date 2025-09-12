import Product from '../models/Product.js';
import ProductImage from '../models/ProductImage.js';
import ProductSpecification from '../models/ProductSpecification.js';
import Brand from '../models/Brand.js';
import Category from '../models/Category.js';
import Color from '../models/Color.js';

// Lấy full sp
export const getProducts = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      brand, 
      category, 
      color, 
      minPrice, 
      maxPrice,
      search 
    } = req.query;

    const filter = {};
    
    if (brand) filter.brand_id = brand;
    if (category) filter.category_id = category;
    if (color) filter.color_id = color;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const products = await Product.find(filter)
      .populate('brand_id', 'name slug')
      .populate('category_id', 'name')
      .populate('color_id', 'name hex')
      .populate('created_by', 'name')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments(filter);

    res.json({
      success: true,
      data: products,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message
    });
  }
};

// chi tiết 
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id)
      .populate('brand_id', 'name slug')
      .populate('category_id', 'name')
      .populate('color_id', 'name hex')
      .populate('created_by', 'name');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    //  hình ảnh 
    const images = await ProductImage.find({ product_id: id });
    
    // Lấy thông số kỹ thuật sản phẩm
    const specifications = await ProductSpecification.findOne({ product_id: id });

    res.json({
      success: true,
      data: {
        ...product.toObject(),
        images: images.map(img => img.url),
        specifications
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching product',
      error: error.message
    });
  }
};

//create
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      color_id,
      category_id,
      brand_id,
      images,
      specifications
    } = req.body;

    const product = new Product({
      name,
      description,
      price,
      color_id,
      category_id,
      brand_id,
      created_by: req.user.id
    });

    await product.save();

    // images
    if (images && images.length > 0) {
      const imagePromises = images.map(url => 
        new ProductImage({ product_id: product._id, url }).save()
      );
      await Promise.all(imagePromises);
    }

    // specifications
    if (specifications) {
      const spec = new ProductSpecification({
        product_id: product._id,
        ...specifications
      });
      await spec.save();
    }

    const populatedProduct = await Product.findById(product._id)
      .populate('brand_id', 'name slug')
      .populate('category_id', 'name')
      .populate('color_id', 'name hex')
      .populate('created_by', 'name');

    res.status(201).json({
      success: true,
      data: populatedProduct
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating product',
      error: error.message
    });
  }
};

// update
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const product = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('brand_id', 'name slug')
     .populate('category_id', 'name')
     .populate('color_id', 'name hex')
     .populate('created_by', 'name');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating product',
      error: error.message
    });
  }
};

// Xóa 
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    await ProductImage.deleteMany({ product_id: id });
    await ProductSpecification.deleteMany({ product_id: id });

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting product',
      error: error.message
    });
  }
};
