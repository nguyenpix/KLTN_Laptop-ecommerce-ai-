import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

// Import models
import Color from '../models/Color.js';
import Brand from '../models/Brand.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
// import ProductSpecification from '../models/ProductSpecification.js';

// Import config
import { MONGODB_URI } from '../config/mongodb.js';

const dataDir = path.join(process.cwd(), 'src', 'data');

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

async function importColors() {
  try {
    const colorsData = JSON.parse(fs.readFileSync(path.join(dataDir, 'colors.json'), 'utf8'));
    
    // Clear existing colors
    await Color.deleteMany({});
    
    // Insert new colors
    const colors = await Color.insertMany(colorsData);
    console.log(`✅ Imported ${colors.length} colors`);
    return colors;
  } catch (error) {
    console.error('❌ Error importing colors:', error);
    throw error;
  }
}

async function importBrands() {
  try {
    const brandsData = JSON.parse(fs.readFileSync(path.join(dataDir, 'brands.json'), 'utf8'));
    
    // Clear existing brands
    await Brand.deleteMany({});
    
    // Insert new brands
    const brands = await Brand.insertMany(brandsData);
    console.log(`✅ Imported ${brands.length} brands`);
    return brands;
  } catch (error) {
    console.error('❌ Error importing brands:', error);
    throw error;
  }
}

async function importCategories() {
  try {
    const categoriesData = JSON.parse(fs.readFileSync(path.join(dataDir, 'categories.json'), 'utf8'));
    
    // Clear existing categories
    await Category.deleteMany({});
    
    // Insert new categories
    const categories = await Category.insertMany(categoriesData);
    console.log(`✅ Imported ${categories.length} categories`);
    return categories;
  } catch (error) {
    console.error('❌ Error importing categories:', error);
    throw error;
  }
}

async function importProducts() {
  try {
    const productsData = JSON.parse(fs.readFileSync(path.join(dataDir, 'products.json'), 'utf8'));
    
    // Clear existing products
    await Product.deleteMany({});
    
    // Get actual ObjectIds from imported data
    const colors = await Color.find({});
    const brands = await Brand.find({});
    const categories = await Category.find({});
    
    // Create a default user ID (you might want to create a real user)
    const defaultUserId = new mongoose.Types.ObjectId();
    
    // Map products with actual ObjectIds
    const mappedProducts = productsData.map(product => {
      const color = colors.find(c => c.id === product.color_id);
      const brand = brands.find(b => b.id === product.brand_id);
      const categoryIds = product.category_ids.map(categoryId => {
        const category = categories.find(c => c.id === categoryId);
        return category ? category._id : null;
      }).filter(id => id !== null);

      return {
        ...product,
        color_id: color ? color._id : colors[0]._id, // Default to first color
        brand_id: brand ? brand._id : brands[0]._id, // Default to first brand
        category_id: categoryIds.length > 0 ? categoryIds : [categories[0]._id], // Default to first category if no valid IDs found
        created_by: defaultUserId
      };
    });
    
    // Insert new products
    const products = await Product.insertMany(mappedProducts);
    console.log(`✅ Imported ${products.length} products`);
    return products;
  } catch (error) {
    console.error('❌ Error importing products:', error);
    throw error;
  }
}

async function importProductSpecifications() {
  try {
    const specificationsData = JSON.parse(fs.readFileSync(path.join(dataDir, 'productSpecifications.json'), 'utf8'));
    
    // Clear existing specifications
    await ProductSpecification.deleteMany({});
    
    // Get actual product ObjectIds
    const products = await Product.find({});
    
    // Map specifications with actual ObjectIds
    const mappedSpecifications = specificationsData.map(spec => {
      const product = products.find(p => p.id === spec.product_id);
      
      return {
        ...spec,
        product_id: product ? product._id : products[0]._id // Default to first product
      };
    });
    
    // Insert new specifications
    const specifications = await ProductSpecification.insertMany(mappedSpecifications);
    console.log(`✅ Imported ${specifications.length} product specifications`);
    return specifications;
  } catch (error) {
    console.error('❌ Error importing product specifications:', error);
    throw error;
  }
}

async function main() {
  try {
    console.log('🚀 Starting data import...');
    
    // Connect to database
    await connectDB();
    
    // Import data in order (due to foreign key relationships)
    console.log('\n📦 Importing Colors...');
    await importColors();
    
    console.log('\n🏢 Importing Brands...');
    await importBrands();
    
    console.log('\n📂 Importing Categories...');
    await importCategories();
    
    console.log('\n💻 Importing Products...');
    await importProducts();
    
    console.log('\n⚙️ Importing Product Specifications...');
    await importProductSpecifications();
    
    console.log('\n🎉 Data import completed successfully!');
    
  } catch (error) {
    console.error('❌ Import failed:', error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('📴 Database connection closed');
    process.exit(0);
  }
}

// Run the import
main();
