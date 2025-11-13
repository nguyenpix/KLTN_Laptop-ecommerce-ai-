import Brand from "../models/Brand.js";

// @desc    Tạo màu sắc mới
// @route   POST /api/v1/Brands
// @access  Private/Admin

export const createBrand = async (req, res) => {
  try {
    const { name, code } = req.body;
    const Brand = new Brand({ name, code });
    await Brand.save();
    res.status(201).json({ success: true, data: Brand });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
// @desc    Lấy tất cả màu sắc
// @route   GET /api/v1/Brands
// @access  Public      
export const getBrands = async (req, res) => {
  try {
    const Brands = await Brand.find();
    res.status(200).json({ success: true, data: Brands });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
export const getBrandById = async (req, res) => {
  try {
    const Brand = await Brand.findById(req.params.id);
    if (!Brand) {
      return res.status(404).json({ success: false, message: "Màu sắc không tìm thấy" });
    }
    res.status(200).json({ success: true, data: Brand });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
export const updateBrand = async (req, res) => {
  try {
    const Brand = await Brand.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });     
    if (!Brand) {
      return res.status(404).json({ success: false, message: "Màu sắc không tìm thấy" });
    }           
    res.status(200).json({ success: true, data: Brand });
    } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
export const deleteBrand = async (req, res) => {
    try { 
    const Brand = await Brand.findByIdAndDelete(req.params.id);
    if (!Brand) {
      return res.status(404).json({ success: false, message: "Màu sắc không tìm thấy" });
    }
    res.status(200).json({ success: true, data: Brand });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
export const getBrandByName = async (req, res) => {
    try {
    const Brand = await Brand.findOne({ name: req.params.name });
    if (!Brand) {
      return res.status(404).json({ success: false, message: "Màu sắc không tìm thấy" });
    }
    res.status(200).json({ success: true, data: Brand });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};