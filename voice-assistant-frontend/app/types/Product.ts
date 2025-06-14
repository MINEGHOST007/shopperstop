/**
 * Product Type Definitions for Walmart AR Viewer
 * 
 * This file contains all TypeScript interfaces and types used throughout
 * the AR product viewer application. It defines the structure for products,
 * pricing, ratings, assets, and viewing states.
 */

// Product annotation interface for 3D model hotspots
export interface ProductAnnotation {
  position: string;
  normal: string;
  title: string;
  orbit?: string;
}

// Core product interface matching the JSON catalog structure
export interface Product {
  annotations?: ProductAnnotation[];
  id: string;                    // Unique product identifier (e.g., "WM001")
  sku: string;                   // Stock keeping unit for inventory
  name: string;                  // Display name of the product
  brand: string;                 // Brand/manufacturer name
  category: string;              // Primary category (Electronics, Furniture, etc.)
  subcategory: string;           // More specific category
  price: ProductPrice;           // Pricing information
  description: string;           // Detailed product description
  features: string[];            // Key product features list
  specifications: Record<string, string>; // Technical specifications
  dimensions: ProductDimensions; // Physical dimensions
  weight: ProductWeight;         // Product weight
  colors: string[];              // Available color options
  sizes?: string[];              // Available sizes (for applicable products)
  availability: ProductAvailability; // Stock and warehouse info
  rating: ProductRating;         // Customer rating data
  assets: ProductAssets;         // Images and 3D model references
  seo: ProductSEO;              // SEO metadata
}

// Pricing structure with discount support
export interface ProductPrice {
  current: number;               // Current selling price
  original: number;              // Original/MSRP price
  currency: string;              // Currency code (USD, EUR, etc.)
  discount: number;              // Discount percentage
}

// Physical dimensions of the product
export interface ProductDimensions {
  width: number;                 // Width in specified unit
  height: number;                // Height in specified unit
  depth: number;                 // Depth in specified unit
  unit: string;                  // Unit of measurement (mm, cm, inches)
}

// Product weight information
export interface ProductWeight {
  value: number;                 // Weight value
  unit: string;                  // Weight unit (g, kg, lbs)
}

// Stock and availability information
export interface ProductAvailability {
  inStock: boolean;              // Whether product is currently in stock
  quantity: number;              // Available quantity
  warehouse: string;             // Warehouse location code
}

// Customer rating and review data
export interface ProductRating {
  average: number;               // Average rating (0-5)
  count: number;                 // Total number of reviews
  distribution: {                // Rating distribution
    5: number;                   // 5-star reviews count
    4: number;                   // 4-star reviews count
    3: number;                   // 3-star reviews count
    2: number;                   // 2-star reviews count
    1: number;                   // 1-star reviews count
  };
}

// Asset references for images and 3D models
export interface ProductAssets {
  images: string[];              // Array of image file paths
  primaryImage: string;          // Main product image path
  model3D: string;               // 3D model file path (.glb, .gltf, .obj)
  modelColor: string;            // Primary color for 3D model theming
  modelScale: number;            // Default scale for 3D model display
}

// SEO metadata for product pages
export interface ProductSEO {
  title: string;                 // SEO page title
  description: string;           // Meta description
  keywords: string[];            // SEO keywords array
}

// Catalog metadata structure
export interface ProductCatalog {
  catalog: {
    version: string;             // Catalog version
    lastUpdated: string;         // Last update timestamp
    totalProducts: number;       // Total number of products
    categories: string[];        // Available categories
  };
  products: Record<string, Product>; // Products indexed by ID
}

// AR Viewer specific types
export type ViewMode = 'ar' | 'rotate' | 'gallery';

// 3D viewing state for AR interactions
export interface ViewState {
  mode: ViewMode;                // Current viewing mode
  rotation: {                    // 3D rotation angles
    x: number;                   // X-axis rotation (degrees)
    y: number;                   // Y-axis rotation (degrees)
    z: number;                   // Z-axis rotation (degrees)
  };
  scale: number;                 // Scale factor for zoom
  position: {                    // 2D position offset
    x: number;                   // X-axis offset (pixels)
    y: number;                   // Y-axis offset (pixels)
  };
}

// Filter and search types for product catalog
export interface ProductFilters {
  category?: string;             // Filter by category
  priceRange?: {                 // Price range filter
    min: number;
    max: number;
  };
  inStock?: boolean;             // Filter by availability
  rating?: number;               // Minimum rating filter
  brand?: string;                // Filter by brand
}

// Search and sort options
export type SortOption = 'price-low' | 'price-high' | 'rating' | 'newest' | 'popular';

export interface SearchOptions {
  query?: string;                // Search query string
  filters?: ProductFilters;      // Applied filters
  sort?: SortOption;             // Sort option
  limit?: number;                // Results limit
  offset?: number;               // Pagination offset
}