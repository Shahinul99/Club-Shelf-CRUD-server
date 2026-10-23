const fs = require('fs');
const path = require('path');

async function seedProductsIfEmpty(products) {
  const existing = await products.countDocuments();
  if (existing > 0) {
    console.log(`Collection already has ${existing} products. Nothing inserted.`);
    return;
  }

  const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'seed-data.json'), 'utf8'));
  const result = await products.insertMany(data);
  console.log(`Inserted ${result.insertedCount} products.`);
}

module.exports = seedProductsIfEmpty;
