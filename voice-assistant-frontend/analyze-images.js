// Script to analyze external image URLs in combined-products.json
const fs = require('fs');
const path = require('path');

// Get the path to the combined-products.json file
const combinedProductsPath = path.join(__dirname, 'public', 'combined-products.json');

// Read the combined-products.json file
const combinedProductsData = JSON.parse(fs.readFileSync(combinedProductsPath, 'utf8'));

// Function to get image paths from product data
const getImagePaths = (product) => {
  const paths = [];
  if (product.thumbnail) {
    paths.push(product.thumbnail);
  }
  if (product.images && Array.isArray(product.images)) {
    paths.push(...product.images);
  }
  return paths;
};

// Get all image paths from products
const arProductImages = Object.values(combinedProductsData.arProducts || {})
  .flatMap(getImagePaths);

const regularProductImages = (combinedProductsData.products || [])
  .flatMap(getImagePaths);

// Combine all image paths
const allImagePaths = [...arProductImages, ...regularProductImages];

// Count external URLs
const externalUrls = allImagePaths.filter(url => url.startsWith('http'));
const dummyJsonUrls = externalUrls.filter(url => url.includes('dummyjson.com'));

console.log(`Total images: ${allImagePaths.length}`);
console.log(`External URLs: ${externalUrls.length}`);
console.log(`DummyJSON URLs: ${dummyJsonUrls.length}`);

// Print some examples of external URLs
if (dummyJsonUrls.length > 0) {
  console.log('\nExamples of DummyJSON URLs:');
  dummyJsonUrls.slice(0, 5).forEach(url => console.log(url));
}
