import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';

dotenv.config({ path: new URL('../../.env', import.meta.url) });

const INDEX_DEFINITIONS = [
  {
    name: 'item_cf_vector_index',
    type: 'vectorSearch',
    definition: {
      fields: [
        {
          type: 'vector',
          path: 'item_cf_vector',
          numDimensions: 8,
          similarity: 'cosine',
        },
      ],
    },
  },
  {
    name: 'item_content_vector_index',
    type: 'vectorSearch',
    definition: {
      fields: [
        {
          type: 'vector',
          path: 'item_content_vector',
          numDimensions: 384,
          similarity: 'cosine',
        },
      ],
    },
  },
];

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✓ Connected to MongoDB Atlas');

  const collection = Product.collection;

  const existing = await collection.listSearchIndexes().toArray();
  console.log(
    'Existing search indexes on products:',
    existing.map((idx) => ({
      name: idx.name,
      type: idx.type,
      status: idx.status,
      queryable: idx.queryable,
      fields: idx.latestDefinition?.fields,
    }))
  );

  for (const idxDef of INDEX_DEFINITIONS) {
    const found = existing.find((e) => e.name === idxDef.name);
    if (!found) {
      console.log(`Creating Atlas Vector Search index "${idxDef.name}"...`);
      const createdName = await collection.createSearchIndex(idxDef);
      console.log(`✓ Created index: ${createdName}`);
    } else {
      const currentDim = found.latestDefinition?.fields?.[0]?.numDimensions;
      const targetDim = idxDef.definition.fields[0].numDimensions;
      if (currentDim !== targetDim) {
        console.log(
          `Updating index "${idxDef.name}" dimensions from ${currentDim} to ${targetDim}...`
        );
        await collection.updateSearchIndex(idxDef.name, idxDef.definition);
        console.log(`✓ Updated index: ${idxDef.name}`);
      } else {
        console.log(
          `✓ Index "${idxDef.name}" already exists (status: ${found.status}, queryable: ${found.queryable}, dim: ${currentDim})`
        );
      }
    }
  }

  // Poll up to 45s for indexes to become READY / queryable
  for (let attempt = 1; attempt <= 9; attempt++) {
    const current = await collection.listSearchIndexes().toArray();
    const statuses = current.map((i) => ({
      name: i.name,
      status: i.status,
      queryable: i.queryable,
    }));
    console.log(`[Check ${attempt}] Index statuses:`, statuses);
    const allReady = INDEX_DEFINITIONS.every((def) => {
      const match = current.find((c) => c.name === def.name);
      return match && match.queryable === true && match.status === 'READY';
    });
    if (allReady) {
      console.log('🎉 Both Atlas Vector Search indexes are READY and QUERYABLE!');
      break;
    }
    if (attempt < 9) {
      await new Promise((r) => setTimeout(r, 5000));
    }
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Error managing Atlas Vector Search indexes:', err);
  process.exit(1);
});
