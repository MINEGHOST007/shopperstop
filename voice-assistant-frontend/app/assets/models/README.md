# 3D Models Directory

This directory contains all 3D model files for products in the Walmart AR viewer.

## File Structure
```
models/
├── electronics/
│   ├── headphones-pro.glb
│   ├── laptop-pro.glb
│   └── smart-watch.glb
├── furniture/
│   ├── office-chair.glb
│   └── coffee-table.glb
├── fashion/
│   └── running-shoes.glb
└── home/
    └── air-fryer.glb
```

## Supported Formats
- `.glb` - Preferred format for web delivery (binary glTF)
- `.gltf` - Text-based glTF with separate assets
- `.obj` - Wavefront OBJ (with .mtl material files)

## Model Requirements
- Maximum file size: 10MB per model
- Optimized for web delivery
- Proper UV mapping for textures
- Centered at origin (0,0,0)
- Appropriate scale for AR viewing

## Adding New Models
1. Place model files in appropriate category folder
2. Update the product catalog JSON with model path
3. Ensure model is optimized for web performance
4. Test loading and rendering in AR viewer