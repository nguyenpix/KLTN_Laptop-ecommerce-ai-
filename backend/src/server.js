import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
// import { mapOrder } from './src/utils/sorts.js'

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
    // console.log(mapOrder(
    //     [ { id: 'id-1', name: 'One' },
    //       { id: 'id-2', name: 'Two' },
    //       { id: 'id-3', name: 'Three' },
    //       { id: 'id-4', name: 'Four' },
    //       { id: 'id-5', name: 'Five' } ],
    //     ['id-5', 'id-4', 'id-2', 'id-3', 'id-1'],
    //     'id'
    //   ))
      res.end('<h1>Hello World!</h1><hr>')
});


app.listen(PORT, () => console.log(`✅ Backend running on port ${PORT}`));

