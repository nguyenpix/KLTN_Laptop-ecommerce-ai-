// models/UserProfile.js
const mongoose = require('mongoose');

const userProfileSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  profile: {
    preferences: {
        price: { type: Number, default: {}},
        brands: { type: Map, of: Number, default: {} }, // e.g., { "Dell": 10, "Asus": 5 }
        categories: { type: Map, of: Number, default: {} }, // e.g., { "laptop_gaming": 10 }
        gpu_specs: { type: Map, of: Number, default: {} },
        cpu_specs: { type: Map, of: Number, default: {} },
        ram_specs: { type: Map, of: Number, default: {} },
        display_specs: { type: Map, of: Number, default: {} },
        storage_specs: { type: Map, of: Number, default: {} }
    }
  }
}, { timestamps: true });

module.exports = mongoose.model('UserProfile', userProfileSchema);