import mongoose from 'mongoose';
import Product from '../models/Product.js';

const escapeRegex = (str) => String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

//  Tạo sản phẩm mới
export const createProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

//  Lấy danh sách sản phẩm (hỗ trợ phân trang, tìm kiếm, lọc cấu hình phần cứng)
export const getProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      fields,
      sort,
      tags,
      category,
      brand,
      color,
      minPrice,
      maxPrice,
      search,
      cpu,
      ram,
      gpu,
      storage,
    } = req.query;

    const filters = {};
    const andConditions = [];

    if (brand) {
      filters.brand_id = brand;
    }
    if (category) {
      filters.category_id = category;
    }
    if (color) {
      filters.color_id = color;
    }

    if (minPrice || maxPrice) {
      filters.price = {};
      if (minPrice) {
        filters.price.$gte = Number(minPrice);
      }
      if (maxPrice) {
        filters.price.$lte = Number(maxPrice);
      }
    }

    // Xử lý lọc cho tags (tìm sản phẩm chứa TẤT CẢ các tags được cung cấp)
    if (tags) {
      filters.tags = { $all: tags.split(',') };
    }

    // Tìm kiếm toàn văn theo tên, tiêu đề, mã SKU hoặc part_number
    if (search && String(search).trim()) {
      const safeSearch = escapeRegex(String(search).trim());
      const searchRegex = new RegExp(safeSearch, 'i');
      andConditions.push({
        $or: [
          { title: searchRegex },
          { name: searchRegex },
          { sku: searchRegex },
          { part_number: searchRegex },
        ],
      });
    }

    // Lọc theo thông số phần cứng (CPU, RAM, GPU, Ổ cứng)
    if (cpu && String(cpu).trim()) {
      const cpuRegex = new RegExp(escapeRegex(String(cpu).trim()), 'i');
      andConditions.push({
        $or: [{ 'specifications.cpu': cpuRegex }, { 'specifications.processor': cpuRegex }],
      });
    }

    if (ram && String(ram).trim()) {
      const ramRegex = new RegExp(escapeRegex(String(ram).trim()), 'i');
      andConditions.push({ 'specifications.ram': ramRegex });
    }

    if (gpu && String(gpu).trim()) {
      const gpuRegex = new RegExp(escapeRegex(String(gpu).trim()), 'i');
      andConditions.push({
        $or: [{ 'specifications.gpu': gpuRegex }, { 'specifications.graphics': gpuRegex }],
      });
    }

    if (storage && String(storage).trim()) {
      const storageRegex = new RegExp(escapeRegex(String(storage).trim()), 'i');
      andConditions.push({
        $or: [
          { 'specifications.storage': storageRegex },
          { 'specifications.storage_capacity': storageRegex },
        ],
      });
    }

    if (andConditions.length > 0) {
      filters.$and = andConditions;
    }

    let query = Product.find(filters);

    // 2. Sắp xếp (Sorting)
    if (sort) {
      const sortBy = sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt'); // Mặc định sắp xếp theo sản phẩm mới nhất
    }

    // 3. Chọn trường (Field Limiting)
    const populatePaths = ['brand_id', 'color_id', 'category_id'];
    if (fields) {
      const fieldsArray = fields.split(',');
      const mainSelectFields = new Set(fieldsArray.map((f) => f.split('.')[0]));
      query = query.select(Array.from(mainSelectFields).join(' '));

      populatePaths.forEach((path) => {
        const subFields = fieldsArray
          .filter((f) => f.startsWith(path + '.'))
          .map((f) => f.substring(path.length + 1));

        if (subFields.length > 0) {
          query = query.populate({ path: path, select: subFields.join(' ') });
        } else if (fieldsArray.includes(path)) {
          query = query.populate(path);
        }
      });
    } else {
      populatePaths.forEach((path) => (query = query.populate(path)));
    }

    // Đếm tổng số lượng sản phẩm khớp với bộ lọc (trước khi phân trang)
    const count = await Product.countDocuments(filters);

    // 4. Phân trang (Pagination)
    const products = await query
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean()
      .exec();

    res.status(200).json({
      success: true,
      total: count,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      totalPages: Math.ceil(count / limit),
      data: products,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//  Lấy chi tiết sản phẩm theo ID (dùng _id - MongoDB ObjectId)
export const getProductById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'ID sản phẩm không hợp lệ',
      });
    }

    let query = Product.findById(req.params.id);

    if (req.query.fields) {
      const fieldsArray = req.query.fields.split(',');
      const fieldsString = fieldsArray.join(' ');
      query = query.select(fieldsString);

      if (fieldsArray.includes('brand_id')) {
        query = query.populate('brand_id');
      }
      if (fieldsArray.includes('color_id')) {
        query = query.populate('color_id');
      }
      if (fieldsArray.includes('category_id')) {
        query = query.populate('category_id');
      }
    } else {
      query = query.populate('brand_id').populate('color_id').populate('category_id');
    }

    const product = await query.lean();

    if (!product) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//  Cập nhật sản phẩm (làm sạch payload, chặn stock/price âm, hỗ trợ runValidators)
export const updateProduct = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'ID sản phẩm không hợp lệ' });
    }

    const updateData = { ...req.body };
    delete updateData._id;
    delete updateData.createdAt;
    delete updateData.updatedAt;
    delete updateData.__v;

    if (updateData.stock !== undefined && Number(updateData.stock) < 0) {
      return res.status(400).json({ success: false, message: 'Số lượng tồn kho không được âm' });
    }
    if (updateData.price !== undefined && Number(updateData.price) < 0) {
      return res.status(400).json({ success: false, message: 'Giá sản phẩm không được âm' });
    }

    // Chuẩn hóa các trường tham chiếu nếu client lỡ gửi object đã populate
    if (updateData.brand_id && typeof updateData.brand_id === 'object' && updateData.brand_id._id) {
      updateData.brand_id = updateData.brand_id._id;
    }
    if (Array.isArray(updateData.color_id)) {
      updateData.color_id = updateData.color_id[0];
    }
    if (updateData.color_id && typeof updateData.color_id === 'object' && updateData.color_id._id) {
      updateData.color_id = updateData.color_id._id;
    }
    if (Array.isArray(updateData.category_id)) {
      updateData.category_id = updateData.category_id.map((c) =>
        c && typeof c === 'object' && c._id ? c._id : c
      );
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate('brand_id')
      .populate('color_id')
      .populate('category_id');

    if (!product) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

//  Xóa sản phẩm
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
    }

    res.status(200).json({ success: true, message: 'Xóa sản phẩm thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
