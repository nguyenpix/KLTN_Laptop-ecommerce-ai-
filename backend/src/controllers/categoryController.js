import Category from '../models/Category.js';

// @desc    Tạo danh mục mới
// @route   POST /api/v1/categories
// @access  Private/Admin
export const createCategory = async (req, res) => {
  try {
    const { name, parent_id } = req.body;
    const category = new Category({ name, parent_id: parent_id || null });
    await category.save();
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Lấy tất cả danh mục
// @route   GET /api/v1/categories
// @access  Public
export const getCategories = async (req, res) => {
  try {
    // Lấy tất cả danh mục và populate parent_id để hiển thị tên của danh mục cha
    const categories = await Category.find().populate('parent_id', 'name');
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Lấy một danh mục theo ID
// @route   GET /api/v1/categories/:id
// @access  Public
export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id).populate('parent_id', 'name');
    if (!category) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục' });
    }
    res.status(200).json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cập nhật danh mục
// @route   PUT /api/v1/categories/:id
// @access  Private/Admin
export const updateCategory = async (req, res) => {
  try {
    const { name, parent_id } = req.body;
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, parent_id: parent_id || null },
      { new: true, runValidators: true }
    );
    if (!category) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục' });
    }
    res.status(200).json({ success: true, data: category });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Xóa danh mục
// @route   DELETE /api/v1/categories/:id
// @access  Private/Admin
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục' });
    }
    // Optional: Handle cascading deletes for child categories or products if needed
    res.status(200).json({ success: true, message: 'Xóa danh mục thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCategoryByName = async (req, res) => {
  try {
    const category = await Category.findOne({ name: req.params.name }).populate('parent_id', 'name');
    if (!category) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục' });
    }
    res.status(200).json({ success: true, data: category });
  }
  catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};