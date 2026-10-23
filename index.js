require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const seedProductsIfEmpty = require('./seedProducts');
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const { DB_USER, DB_PASS } = process.env;
if (!DB_USER || !DB_PASS) {
  throw new Error('DB_USER and DB_PASS must be set in the environment');
}

const uri = `mongodb+srv://${encodeURIComponent(DB_USER)}:${encodeURIComponent(DB_PASS)}@cluster0.lkuylym.mongodb.net/`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function disconnectFromMongoDB() {
  await client.close();
}

module.exports = { disconnectFromMongoDB };

async function run() {
  try {
    await client.connect();
    const products = client.db('shopDB').collection('products');
    await seedProductsIfEmpty(products);

    // READ all
    app.get('/products', async (req, res) => {
      const result = await products.find().toArray();
      res.send(result);
    });

    // READ one
    app.get('/products/:id', async (req, res) => {
      try {
        const product = await products.findOne({ _id: new ObjectId(req.params.id) });
        if (!product) return res.status(404).send({ message: 'Product not found' });
        res.send(product);
      } catch {
        res.status(400).send({ message: 'Invalid product id' });
      }
    });

    // CREATE
    app.post('/products', async (req, res) => {
      const result = await products.insertOne(req.body);
      res.send(result);
    });

    // UPDATE
    app.put('/products/:id', async (req, res) => {
      try {
        const { _id, ...fields } = req.body; // never try to overwrite _id
        const result = await products.updateOne(
          { _id: new ObjectId(req.params.id) },
          { $set: fields }
        );
        res.send(result);
      } catch {
        res.status(400).send({ message: 'Invalid product id' });
      }
    });

    // DELETE
    app.delete('/products/:id', async (req, res) => {
      try {
        const result = await products.deleteOne({ _id: new ObjectId(req.params.id) });
        res.send(result);
      } catch {
        res.status(400).send({ message: 'Invalid product id' });
      }
    });

    await client.db('admin').command({ ping: 1 });
    console.log('Connected to MongoDB');
    app.listen(port, () => console.log(`Server listening on port ${port}`));
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    process.exitCode = 1;
  }
}
run();

app.get('/', (req, res) => res.send('Shop server is running'));
