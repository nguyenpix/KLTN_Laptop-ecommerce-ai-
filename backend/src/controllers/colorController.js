import Color from "../models/Color.js";

// @desc    Tạo màu sắc mới
// @route   POST /api/v1/colors
// @access  Private/Admin

export const createColor = async (req, res) => {
  try {
    const { name, code } = req.body;
    const color = new Color({ name, code });
    await color.save();
    res.status(201).json({ success: true, data: color });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
// @desc    Lấy tất cả màu sắc
// @route   GET /api/v1/colors
// @access  Public      
export const getColors = async (req, res) => {
  try {
    const colors = await Color.find();
    res.status(200).json({ success: true, data: colors });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
export const getColorById = async (req, res) => {
  try {
    const color = await Color.findById(req.params.id);
    if (!color) {
      return res.status(404).json({ success: false, message: "Màu sắc không tìm thấy" });
    }
    res.status(200).json({ success: true, data: color });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
export const updateColor = async (req, res) => {
  try {
    const color = await Color.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });     
    if (!color) {
      return res.status(404).json({ success: false, message: "Màu sắc không tìm thấy" });
    }           
    res.status(200).json({ success: true, data: color });
    } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
export const deleteColor = async (req, res) => {
    try { 
    const color = await Color.findByIdAndDelete(req.params.id);
    if (!color) {
      return res.status(404).json({ success: false, message: "Màu sắc không tìm thấy" });
    }
    res.status(200).json({ success: true, data: color });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
export const getColorByName = async (req, res) => {
    try {
    const color = await Color.findOne({ name: req.params.name });
    if (!color) {
      return res.status(404).json({ success: false, message: "Màu sắc không tìm thấy" });
    }
    res.status(200).json({ success: true, data: color });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};