// scripts/migrate.js
const mongoose = require('mongoose');
const Product = require('../models/Product');

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  try {
    await Product.updateMany(
      { embedding: { $exists: false } },
      { $set: { embedding: [] } }
    );
    console.log('Migration completed: Added embedding field to all products');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    mongoose.connection.close();
  }
}

migrate();