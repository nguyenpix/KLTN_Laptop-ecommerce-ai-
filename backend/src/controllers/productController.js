import Product from '../models/Product.js';

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

//  Lấy danh sách sản phẩm (có thể phân trang)
export const getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, fields, sort, tags, ...otherFilters } = req.query;
    
    // 1. Lọc (Filtering)
    const filters = { ...otherFilters };
    
    // Xử lý lọc cho tags (tìm sản phẩm chứa TẤT CẢ các tags được cung cấp)
    if (tags) {
        filters.tags = { $all: tags.split(',') };
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
        const mainSelectFields = new Set(fieldsArray.map(f => f.split('.')[0]));
        query = query.select(Array.from(mainSelectFields).join(' '));

        populatePaths.forEach(path => {
            const subFields = fieldsArray
                .filter(f => f.startsWith(path + '.'))
                .map(f => f.substring(path.length + 1));

            if (subFields.length > 0) {
                query = query.populate({ path: path, select: subFields.join(' ') });
            } else if (fieldsArray.includes(path)) {
                query = query.populate(path);
            }
        });
    } else {
        populatePaths.forEach(path => query = query.populate(path));
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
      page: parseInt(page),
      totalPages: Math.ceil(count / limit),
      data: products,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//  Lấy chi tiết sản phẩm theo ID
export const getProductById = async (req, res) => {
  try {
    let query = Product.findOne({ id: req.params.id });

    // Xử lý lựa chọn trường và populate có điều kiện
    if (req.query.fields) {
      const fieldsArray = req.query.fields.split(',');
      const fieldsString = fieldsArray.join(' ');
      query = query.select(fieldsString);

      // Chỉ populate những trường được yêu cầu
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
      // Mặc định: populate tất cả nếu không có chỉ định
      query = query.populate("brand_id").populate("color_id").populate("category_id");
    }

    const product = await query.lean();

    if (!product) {
      return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm" });
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//  Cập nhật sản phẩm
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm" });
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
      return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm" });
    }

    res.status(200).json({ success: true, message: "Xóa sản phẩm thành công" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
