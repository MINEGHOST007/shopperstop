/**
 * Product Service
 * 
 * This service handles all product-related operations including:
 * - Loading and parsing the combined product catalog
 * - Searching and filtering products (both AR and regular)
 * - Managing product assets
 * - Handling 3D model loading for AR products
 */

import { Product, ProductFilters, SearchOptions, SortOption } from '../types/Product';

interface CombinedCatalog {
  catalog: {
    version: string;
    lastUpdated: string;
    totalProducts: number;
    categories: string[];
    arEnabledCategories: string[];
  };
  arProducts: Record<string, Product>;
  products: Product[];
}

class ProductService {
  private catalog: CombinedCatalog | null;
  private products: Product[];
  private arProducts: Product[];

  constructor() {
    // Initialize empty - will be loaded from combined-products.json
    this.catalog = null;
    this.products = [];
    this.arProducts = [];
    this.loadCombinedCatalog();
  }

  /**
   * Load the combined product catalog
   */
  private async loadCombinedCatalog() {
    try {
      const response = await fetch('/combined-products.json');
      const data = await response.json();
      this.catalog = data;
      
      // Convert arProducts object to array
      this.arProducts = Object.values(data.arProducts || {}) as Product[];
      
      // Regular products array
      this.products = [...this.arProducts, ...(data.products || [])];
    } catch (error) {
      console.error('Failed to load combined catalog:', error);
      this.catalog = null;
      this.products = [];
      this.arProducts = [];
    }
  }

  /**
   * Get all products from the catalog (both AR and regular)
   * @returns Array of all products
   */
  getAllProducts(): Product[] {
    return this.products;
  }

  /**
   * Get only AR-enabled products
   * @returns Array of AR products
   */
  getARProducts(): Product[] {
    return this.arProducts;
  }

  /**
   * Get a specific product by ID
   * @param id - Product ID (e.g., "WM001" or numeric ID)
   * @returns Product or undefined if not found
   */
  getProductById(id: string): Product | undefined {
    // First check AR products
    if (this.catalog?.arProducts?.[id]) {
      return this.catalog.arProducts[id];
    }
    
    // Then check regular products
    return this.products.find(product => 
      product.id.toString() === id || 
      (typeof product.id === 'string' && product.id === id)
    );
  }

  /**
   * Get products by category
   * @param category - Category name
   * @returns Array of products in the category
   */
  getProductsByCategory(category: string): Product[] {
    return this.products.filter(product => 
      product.category.toLowerCase() === category.toLowerCase()
    );
  }

  /**
   * Search products with filters and sorting
   * @param options - Search options including query, filters, and sort
   * @returns Filtered and sorted products
   */
  searchProducts(options: SearchOptions): Product[] {
    let results = [...this.products];

    // Apply text search
    if (options.query) {
      const query = options.query.toLowerCase();
      results = results.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.brand.toLowerCase().includes(query) ||
        product.features.some(feature => feature.toLowerCase().includes(query))
      );
    }

    // Apply filters
    if (options.filters) {
      results = this.applyFilters(results, options.filters);
    }

    // Apply sorting
    if (options.sort) {
      results = this.sortProducts(results, options.sort);
    }

    // Apply pagination
    if (options.offset !== undefined && options.limit !== undefined) {
      results = results.slice(options.offset, options.offset + options.limit);
    } else if (options.limit !== undefined) {
      results = results.slice(0, options.limit);
    }

    return results;
  }

  /**
   * Apply filters to product array
   * @param products - Products to filter
   * @param filters - Filters to apply
   * @returns Filtered products
   */
  private applyFilters(products: Product[], filters: ProductFilters): Product[] {
    return products.filter(product => {
      // Category filter
      if (filters.category && product.category !== filters.category) {
        return false;
      }

      // Price range filter
      if (filters.priceRange) {
        const price = product.price.current;
        if (price < filters.priceRange.min || price > filters.priceRange.max) {
          return false;
        }
      }

      // Stock filter
      if (filters.inStock !== undefined && product.availability.inStock !== filters.inStock) {
        return false;
      }

      // Rating filter
      if (filters.rating && product.rating.average < filters.rating) {
        return false;
      }

      // Brand filter
      if (filters.brand && product.brand !== filters.brand) {
        return false;
      }

      return true;
    });
  }

  /**
   * Sort products by specified option
   * @param products - Products to sort
   * @param sortOption - Sort option
   * @returns Sorted products
   */
  private sortProducts(products: Product[], sortOption: SortOption): Product[] {
    return products.sort((a, b) => {
      switch (sortOption) {
        case 'price-low':
          return a.price.current - b.price.current;
        case 'price-high':
          return b.price.current - a.price.current;
        case 'rating':
          return b.rating.average - a.rating.average;
        case 'popular':
          return b.rating.count - a.rating.count;
        case 'newest':
          // For demo purposes, sort by ID (newer products have higher IDs)
          return b.id.localeCompare(a.id);
        default:
          return 0;
      }
    });
  }

  /**
   * Get unique categories from all products
   * @returns Array of unique categories
   */
  getCategories(): string[] {
    return [...new Set(this.products.map(product => product.category))];
  }

  /**
   * Get unique brands from all products
   * @returns Array of unique brands
   */
  getBrands(): string[] {
    return [...new Set(this.products.map(product => product.brand))];
  }

  /**
   * Get price range of all products
   * @returns Object with min and max prices
   */
  getPriceRange(): { min: number; max: number } {
    const prices = this.products.map(product => product.price.current);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices)
    };
  }

  /**
   * Get catalog metadata
   * @returns Catalog information or null if catalog is not loaded
   */
  getCatalogInfo() {
    return this.catalog?.catalog || null;
  }

  /**
   * Validate product image URL
   * @param imagePath - Image path to validate
   * @returns Promise resolving to boolean indicating if image exists
   */
  async validateImageUrl(imagePath: string): Promise<boolean> {
    try {
      const response = await fetch(imagePath, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Get fallback image for products with missing images
   * @param category - Product category for appropriate fallback
   * @returns Fallback image URL
   */
  getFallbackImage(category: string): string {
    const fallbacks: Record<string, string> = {
      'Electronics': 'https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg?auto=compress&cs=tinysrgb&w=800',
      'Furniture': 'https://images.pexels.com/photos/1571459/pexels-photo-1571459.jpeg?auto=compress&cs=tinysrgb&w=800',
      'Fashion': 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800',
      'Home & Kitchen': 'https://images.pexels.com/photos/4099354/pexels-photo-4099354.jpeg?auto=compress&cs=tinysrgb&w=800'
    };
    
    return fallbacks[category] || fallbacks['Electronics'];
  }
}

// Export singleton instance
export const productService = new ProductService();
export default ProductService;