// Run this yourself:  npm run seed
// It reads seed-data.json and inserts 100 sample products into shopDB.products.
// It only inserts when the collection is empty, so it will not create duplicates.
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const seedProductsIfEmpty = require('./seedProducts');

const { DB_USER, DB_PASS } = process.env;
if (!DB_USER || !DB_PASS) {
  throw new Error('DB_USER and DB_PASS must be set in the environment');
}

const uri = `mongodb+srv://${encodeURIComponent(DB_USER)}:${encodeURIComponent(DB_PASS)}@cluster0.lkuylym.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
});

async function seed() {
  try {
    await client.connect();
    const products = client.db('shopDB').collection('products');
    await seedProductsIfEmpty(products);
  } catch (err) {
    console.error('Seeding failed:', err.message);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}
seed();
