# Product Images Directory

This directory contains all product images organized by product ID and image type.

## File Structure
```
images/
├── headphones-pro/
│   ├── main.jpg          # Primary product image
│   ├── side-view.jpg     # Side angle view
│   ├── detail-1.jpg      # Close-up details
│   └── lifestyle.jpg     # Product in use
├── laptop-pro/
│   ├── main.jpg
│   ├── open-view.jpg
│   ├── ports-detail.jpg
│   └── workspace.jpg
└── [product-id]/
    ├── main.jpg          # Required: Primary image
    ├── [view-name].jpg   # Optional: Additional views
    └── ...
```

## Image Requirements
- Format: JPG, PNG, WebP
- Resolution: Minimum 800x800px for main images
- Aspect ratio: 1:1 preferred for product grid
- File size: Maximum 500KB per image
- Naming: Use descriptive, kebab-case names

## Image Types
- `main.jpg` - Primary product image (required)
- `side-view.jpg` - Side angle view
- `back-view.jpg` - Rear view
- `detail-[n].jpg` - Close-up detail shots
- `lifestyle.jpg` - Product in real-world context
- `packaging.jpg` - Product packaging
- `size-comparison.jpg` - Size reference images

## Adding New Images
1. Create folder with product ID name
2. Add main.jpg as primary image
3. Add additional views as needed
4. Update product catalog JSON with image paths
5. Optimize images for web delivery