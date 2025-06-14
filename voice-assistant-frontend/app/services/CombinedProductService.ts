/**
 * Combined Product Service
 * 
 * This service handles all product-related operations for both AR and regular products
 */

// Unified product interface that can handle both AR and regular products
export interface UnifiedProduct {
  id: string | number;
  title?: string;
  name?: string;
  brand: string;
  category: string;
  subcategory?: string;
  price: number;
  discountPercentage?: number;
  rating: number;
  stock: number;
  description: string;
  features?: string[];
  specifications?: Record<string, string>;
  dimensions?: {
    width: number;
    height: number;
    depth: number;
    unit: string;
  };
  weight?: number;
  colors?: string[];
  availabilityStatus?: string;
  warrantyInformation?: string;
  shippingInformation?: string;
  returnPolicy?: string;
  tags?: string[];
  images: string[];
  thumbnail: string;
  hasAR: boolean;
  arAssets?: {
    model3D: string;
    modelColor: string;
    modelScale: number;
  };
}

// Image fallback options
const DEFAULT_IMAGE = '/assets/images/iphoneX.png';
const IMAGE_CATEGORY_FALLBACKS: Record<string, string> = {
  'electronics': '/assets/images/iphoneX.png',
  'furniture': '/assets/images/sofa_default.png',
  'smartphones': '/assets/images/iphoneX.png',
  'laptops': '/assets/images/generic_electronic_default.png',
  'televisions': '/assets/images/mi_tv_default.png',
  'default': '/assets/images/iphoneX.png'
};

// Helper function to get fallback image based on category
const getFallbackImage = (category?: string): string => {
  if (!category) return DEFAULT_IMAGE;
  const lowerCategory = category.toLowerCase();
  return IMAGE_CATEGORY_FALLBACKS[lowerCategory] || DEFAULT_IMAGE;
};

interface CombinedCatalog {
  catalog: {
    version: string;
    lastUpdated: string;
    totalProducts: number;
    categories: string[];
    arEnabledCategories: string[];
  };
  arProducts: Record<string, UnifiedProduct>;
  products: UnifiedProduct[];
}

class CombinedProductService {
  private catalog: CombinedCatalog | null = null;
  private products: UnifiedProduct[] = [];
  private arProducts: UnifiedProduct[] = [];
  private isLoaded = false;

  constructor() {
    this.loadCombinedCatalog();
  }

  /**
   * Load the combined product catalog
   */
  private async loadCombinedCatalog(): Promise<void> {
    try {
      const response = await fetch('/combined-products.json');
      const data = await response.json();
      this.catalog = data;
      
      // Process AR products with fallback images
      this.arProducts = Object.values(data.arProducts || {}).map((product: Partial<UnifiedProduct>) => {
        // Ensure images have local fallbacks to prevent 429 errors
        const category = product.category?.toLowerCase() || 'default';
        const fallbackImage = IMAGE_CATEGORY_FALLBACKS[category] || DEFAULT_IMAGE;
        
        return {
          ...product,
          // Replace external URLs with local fallbacks
          images: (product.images || []).map((img: string) => 
            img.includes('dummyjson.com') ? fallbackImage : img
          ),
          // Replace external thumbnail with local fallback
          thumbnail: product.thumbnail?.includes('dummyjson.com') 
            ? fallbackImage 
            : (product.thumbnail || DEFAULT_IMAGE),
          hasAR: true
        } as UnifiedProduct;
      });
      
      // Process regular products with fallback images
      const regularProducts = (data.products || []).map((product: Partial<UnifiedProduct>) => {
        const category = product.category?.toLowerCase() || 'default';
        const fallbackImage = IMAGE_CATEGORY_FALLBACKS[category] || DEFAULT_IMAGE;
        
        return {
          ...product,
          // Replace external URLs with local fallbacks
          images: (product.images || []).map((img: string) => 
            img.includes('dummyjson.com') ? fallbackImage : img
          ),
          // Replace external thumbnail with local fallback
          thumbnail: product.thumbnail?.includes('dummyjson.com') 
            ? fallbackImage 
            : (product.thumbnail || DEFAULT_IMAGE),
          hasAR: false
        } as UnifiedProduct;
      });
      
      // Combine AR and regular products
      this.products = [...this.arProducts, ...regularProducts];
      this.isLoaded = true;
    } catch (error) {
      console.error('Failed to load combined catalog:', error);
      this.catalog = null;
      this.products = [];
      this.arProducts = [];
      this.isLoaded = true;
    }
  }

  /**
   * Wait for catalog to load
   */
  async waitForLoad(): Promise<void> {
    while (!this.isLoaded) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  /**
   * Get all products from the catalog (both AR and regular)
   */
  async getAllProducts(): Promise<UnifiedProduct[]> {
    await this.waitForLoad();
    return this.products;
  }

  /**
   * Get only AR-enabled products
   */
  async getARProducts(): Promise<UnifiedProduct[]> {
    await this.waitForLoad();
    return this.arProducts;
  }

  /**
   * Get a specific product by ID
   */
  async getProductById(id: string | number): Promise<UnifiedProduct | undefined> {
    await this.waitForLoad();
    
    // First check AR products
    if (this.catalog?.arProducts?.[id.toString()]) {
      return this.catalog.arProducts[id.toString()];
    }
    
    // Then check regular products
    return this.products.find(product => 
      product.id.toString() === id.toString()
    );
  }

  /**
   * Get products by category
   */
  async getProductsByCategory(category: string): Promise<UnifiedProduct[]> {
    await this.waitForLoad();
    return this.products.filter(product => 
      product.category.toLowerCase() === category.toLowerCase()
    );
  }

  /**
   * Search products
   */
  async searchProducts(query: string): Promise<UnifiedProduct[]> {
    await this.waitForLoad();
    if (!query.trim()) return this.products;
    
    const searchTerm = query.toLowerCase();
    return this.products.filter(product => 
      (product.title || product.name || '').toLowerCase().includes(searchTerm) ||
      (product.description || '').toLowerCase().includes(searchTerm) ||
      (product.brand || '').toLowerCase().includes(searchTerm) ||
      (product.tags || []).some(tag => (tag || '').toLowerCase().includes(searchTerm))
    );
  }

  /**
   * Get all categories
   */
  async getCategories(): Promise<string[]> {
    await this.waitForLoad();
    return this.catalog?.catalog.categories || [];
  }

  /**
   * Get AR-enabled categories
   */
  async getARCategories(): Promise<string[]> {
    await this.waitForLoad();
    return this.catalog?.catalog.arEnabledCategories || [];
  }
}

// Export a singleton instance
export const combinedProductService = new CombinedProductService();
export default combinedProductService;
