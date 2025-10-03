import mongoose from 'mongoose';
import Product from '../models/Product.js';
import connectDB from '../config/mongodb.js';

const MAPPINGS_TO_FIX = {
  brand: 'brand_id',
  color: 'color_id',
};

const fixImportedFields = async () => {
  console.log('Starting field migration script for brand and color...');
  try {
    await connectDB();
    console.log('MongoDB Connected...');

    for (const [wrongField, correctField] of Object.entries(MAPPINGS_TO_FIX)) {
      console.log(`
Processing: Renaming '${wrongField}' to '${correctField}'...`);
      
      const result = await Product.updateMany(
        { [wrongField]: { $exists: true }, [correctField]: { $exists: false } },
        { $rename: { [wrongField]: correctField } }
      );

      console.log(`- Documents found with incorrect '${wrongField}' field: ${result.matchedCount}`);
      console.log(`- Documents successfully updated: ${result.modifiedCount}`);
    }

    console.log('\nMigration script finished successfully!');

  } catch (error) {
    console.error('An error occurred during the migration:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB Disconnected.');
  }
};

fixImportedFields();