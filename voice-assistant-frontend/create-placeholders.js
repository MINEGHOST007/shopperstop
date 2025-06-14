// Script to create placeholder images for products
const fs = require('fs');
const path = require('path');

// Get the path to the combined-products.json file
const combinedProductsPath = path.join(__dirname, 'public', 'combined-products.json');
const imagesDir = path.join(__dirname, 'public', 'assets', 'images');

// Function to ensure a directory exists
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
};

// Ensure the images directory exists
ensureDirectoryExists(imagesDir);

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

// Get all image paths from AR products
const arProductImages = Object.values(combinedProductsData.arProducts || {})
  .flatMap(getImagePaths)
  .filter(path => path.startsWith('/assets/images/'))
  .map(path => path.substring('/assets/images/'.length));

// Get all image paths from regular products
const regularProductImages = (combinedProductsData.products || [])
  .flatMap(getImagePaths)
  .filter(path => path.startsWith('/assets/images/'))
  .map(path => path.substring('/assets/images/'.length));

// Combine all unique image paths
const allImagePaths = [...new Set([...arProductImages, ...regularProductImages])];

// Check which images exist and which are missing
const existingImages = fs.readdirSync(imagesDir);
const missingImages = allImagePaths.filter(img => !existingImages.includes(img));

console.log('Missing images:', missingImages);

// Create placeholder images for missing files
const placeholderImagePath = path.join(imagesDir, 'iphoneX.png');
if (fs.existsSync(placeholderImagePath)) {
  console.log('Using iphoneX.png as a placeholder for missing images');
  
  missingImages.forEach(imageName => {
    const targetPath = path.join(imagesDir, imageName);
    fs.copyFileSync(placeholderImagePath, targetPath);
    console.log(`Created placeholder for: ${imageName}`);
  });
  
  console.log('All missing images have been replaced with placeholders.');
} else {
  console.error('Placeholder image not found:', placeholderImagePath);
}
