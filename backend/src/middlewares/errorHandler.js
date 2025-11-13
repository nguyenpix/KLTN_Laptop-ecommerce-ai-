// middlewares/errorHandler.js

// Middleware xử lý lỗi chung
export const errorHandler = (err, req, res, next) => {
  console.error("🔥 Error:", err);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Server Error",
  });
};

// Middleware xử lý route không tồn tại
export const notFound = (req, res, next) => {
  // Bỏ qua favicon.ico để tránh spam log
  if (req.originalUrl === "/favicon.ico") {
    return res.status(204).end();
  }

  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};
