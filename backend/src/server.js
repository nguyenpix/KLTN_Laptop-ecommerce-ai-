import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import v1Routes from "./routes/v1/index.js";
import { errorHandler, notFound } from "./middlewares/errorHandler.js";

// Import all models to ensure they are registered with Mongoose
import "./models/Brand.js";
import "./models/Cart.js";
import "./models/CartItem.js";
import "./models/Category.js";
import "./models/Color.js";
import "./models/Feedback.js";
import "./models/News.js";
import "./models/Order.js";
import "./models/OrderItem.js";
import "./models/Product.js";
import "./models/ProductNews.js";
import "./models/User.js";

dotenv.config();

const app = express();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const PORT = process.env.PORT || 5000;

// Kết nối MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log(" MongoDB connected"))
  .catch(err => console.error(" MongoDB error:", err));

// Routes
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Laptop E-commerce API",
    version: "1.0.0",
    endpoints: {
      products: "/api/v1/products",
      users: "/api/v1/users",
      cart: "/api/v1/cart",
      orders: "/api/v1/orders",
      categories: "/api/v1/categories",
      colors: "/api/v1/colors",
      brands: "/api/v1/brands",
      // news: "/api/v1/news",
      // feedbacks: "/api/v1/feedbacks"
    }
  });
});

// Các route API
app.use("/api/v1", v1Routes);

// Middleware xử lý lỗi
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(` Backend running on port ${PORT}`);
  
});

