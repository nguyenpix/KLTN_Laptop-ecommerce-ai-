import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB error:", err));

// Test API
app.get("/", (req, res) => {
  res.json({ message: "Backend API running 🚀" });
});


app.listen(PORT, () => console.log(`✅ Backend running on port ${PORT}`));
