/**
 * Main App Component - Walmart AR Product Viewer
 * 
 * This is the main application component that orchestrates the entire
 * Walmart AR product viewing experience. It manages:
 * - Product catalog loading and display
 * - Product selection and viewing state
 * - AR viewer interactions
 * - Walmart-themed UI and branding
 */

'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, Filter, Sparkles } from 'lucide-react';
import ProductCard, { ProductCardData } from '../../components/ProductCard';
import { ProductViewer } from '../../components/ProductViewer';
import { ProductDetails } from '../../components/ProductDetails';
import { combinedProductService, UnifiedProduct } from '../services/CombinedProductService';

// Type adapter to convert UnifiedProduct to ProductCardData
const convertToProductCard = (product: UnifiedProduct): ProductCardData => {
  const originalPrice = product.discountPercentage ? 
    product.price / (1 - product.discountPercentage / 100) : 
    undefined;

  return {
    id: product.id.toString(),
    product_id: typeof product.id === 'number' ? product.id : parseInt(product.id.toString()),
    title: product.title || product.name || '',
    description: product.description,
    price: product.price,
    original_price: originalPrice,
    discount_percentage: product.discountPercentage || 0,
    category: product.category,
    rating: product.rating,
    stock: product.stock,
    brand: product.brand,
    image: product.thumbnail,
    tags: product.tags || product.features?.slice(0, 3) || []
  };
};

// Type adapter to convert UnifiedProduct to the Product type expected by ProductViewer/ProductDetails
const convertToViewerProduct = (product: UnifiedProduct) => {
  return {
    ...product,
    id: product.id.toString(),
    name: product.title || product.name || 'Unknown Product',
    subcategory: product.subcategory || 'General',
    colors: product.colors || [],
    features: product.features || [],
    specifications: product.specifications || {},
    dimensions: product.dimensions || { width: 0, height: 0, depth: 0, unit: 'cm' },
    weight: { value: product.weight || 0, unit: 'kg' },
    price: {
      current: product.price,
      original: product.discountPercentage ? 
        product.price / (1 - product.discountPercentage / 100) : 
        product.price,
      currency: 'USD',
      discount: product.discountPercentage || 0
    },
    rating: {
      average: product.rating,
      count: 100,
      distribution: {
        5: 70,
        4: 20,
        3: 7,
        2: 2,
        1: 1
      }
    },
    availability: {
      inStock: product.stock > 0,
      quantity: product.stock,
      warehouse: 'WM-001'
    },
    assets: {
      images: product.images,
      primaryImage: product.thumbnail,
      model3D: product.arAssets?.model3D || '',
      modelColor: product.arAssets?.modelColor || '#cccccc',
      modelScale: product.arAssets?.modelScale || 1.0
    },
    sku: product.id.toString(),
    seo: {
      title: product.title || product.name || '',
      description: product.description,
      keywords: product.tags || []
    }
  };
};

function App() {
  // State management
  const [products, setProducts] = useState<UnifiedProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<UnifiedProduct | null>(null);
  const [showDetails, setShowDetails] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [cartItems, setCartItems] = useState<string[]>([]);

  // Load products on component mount
  useEffect(() => {
    const loadProducts = async () => {
      const allProducts = await combinedProductService.getARProducts(); // Only AR products for AR viewer
      setProducts(allProducts);
      if (allProducts.length > 0) {
        setSelectedProduct(allProducts[0]);
      }
    };
    loadProducts();
  }, []);

  // Filter products based on search and category
  const filteredProducts = React.useMemo(() => {
    let filtered = products;

    // Apply category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product =>
        (product.title || product.name || '').toLowerCase().includes(query) ||
        (product.description || '').toLowerCase().includes(query) ||
        (product.brand || '').toLowerCase().includes(query) ||
        (product.features || []).some((feature: string) => (feature || '').toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [products, selectedCategory, searchQuery]);

  // Get unique categories
  const categories = React.useMemo(() => {
    const uniqueCategories = [...new Set(products.map(product => product.category))];
    return ['All', ...uniqueCategories];
  }, [products]);

  // Handle product selection
  const handleProductSelect = (product: UnifiedProduct) => {
    setSelectedProduct(product);
  };

  // Handle add to cart
  const handleToggleCart = () => {
    if (!selectedProduct) return;
    
    const productId = selectedProduct.id.toString();
    if (cartItems.includes(productId)) {
      setCartItems(cartItems.filter(id => id !== productId));
      console.log('Removed from cart:', selectedProduct.title || selectedProduct.name);
    } else {
      setCartItems([...cartItems, productId]);
      console.log('Added to cart:', selectedProduct.title || selectedProduct.name);
    }
  };

  // Calculate total cart value
  const cartTotal = React.useMemo(() => {
    return cartItems.reduce((total, itemId) => {
      const product = products.find(p => p.id.toString() === itemId);
      return total + (product?.price || 0);
    }, 0);
  }, [cartItems, products]);

  if (!selectedProduct) {
    return (
      <div className="min-h-screen bg-walmart-blue flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-16 h-16 bg-walmart-yellow rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="text-walmart-blue" size={32} />
          </div>
          <h1 className="text-2xl font-bold mb-2">Loading Walmart AR Viewer...</h1>
          <p className="text-blue-200">Preparing your shopping experience</p>
        </div>
      </div>
    );
  }

  return (
    <div className=" bg-walmart-gray flex font-walmart">
      {/* Enhanced Sidebar with better alignment */}
      <div className="w-96 bg-white shadow-xl flex flex-col border-r border-gray-200 relative">
        {/* Header with improved spacing and alignment */}
        <div className="bg-walmart-blue text-white p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-walmart-yellow rounded-full flex items-center justify-center shadow-lg">
              <span className="text-walmart-blue font-bold text-2xl">✱</span>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold leading-tight">Walmart</h1>
              <p className="text-blue-200 text-sm font-medium mt-1">AR Product Viewer</p>
            </div>
          </div>

          {/* Enhanced Search Bar with better alignment */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={20} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl border-0 text-gray-900 placeholder-gray-500 focus:ring-3 focus:ring-walmart-yellow/50 focus:outline-none text-base shadow-inner"
            />
          </div>
        </div>

        {/* Stats and Cart with improved layout */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-walmart-gray to-gray-50">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl p-5 text-center shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
              <div className="text-3xl font-bold text-walmart-blue mb-2">{filteredProducts.length}</div>
              <div className="text-walmart-dark-gray text-xs uppercase font-semibold tracking-wider">Products</div>
            </div>
            <div className="bg-white rounded-xl p-5 text-center shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-center gap-2 mb-2">
                <ShoppingCart className="text-walmart-yellow" size={18} />
                <span className="text-3xl font-bold text-gray-900">{cartItems.length}</span>
              </div>
              <div className="text-walmart-dark-gray text-xs uppercase font-semibold tracking-wider">
                Cart (${cartTotal.toFixed(2)})
              </div>
            </div>
          </div>
        </div>

        {/* Category Filter with better spacing */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <Filter className="text-walmart-dark-gray" size={20} />
            <h3 className="font-bold text-walmart-dark-gray text-lg">Categories</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 transform hover:scale-105 ${
                  selectedCategory === category
                    ? 'bg-walmart-blue text-white hover:bg-walmart-blue-dark shadow-md ring-2 ring-walmart-blue/20'
                    : 'bg-gray-200 text-walmart-dark-gray hover:bg-gray-300 hover:shadow-sm'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid with improved spacing and alignment */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-walmart-dark-gray flex items-center gap-2">
              <span>Products</span>
              <span className="bg-walmart-blue text-white text-sm px-2 py-1 rounded-full">
                {filteredProducts.length}
              </span>
            </h2>
            <button 
              onClick={() => setShowDetails(!showDetails)}
              className={`text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-200 ${
                showDetails 
                  ? 'bg-walmart-blue text-white hover:bg-walmart-blue-dark' 
                  : 'text-walmart-blue hover:bg-blue-50 border border-walmart-blue'
              }`}
            >
              {showDetails ? 'Hide Details' : 'Show Details'}
            </button>
          </div>
          
          <div className="space-y-4">
            {filteredProducts.map((product) => {
              // Use the convertToProductCard function
              const cardData = convertToProductCard(product);
              
              return (
                <ProductCard
                  key={product.id}
                  card={cardData}
                  onAction={(id, action) => {
                    if (action === 'select') {
                      handleProductSelect(product);
                    }
                  }}
                />
              );
            })}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-16">
              <div className="text-gray-400 mb-4">
                <Search size={64} className="mx-auto" />
              </div>
              <h3 className="text-xl font-bold text-walmart-dark-gray mb-3">No products found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your search or filters.</p>
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                className="px-6 py-3 bg-walmart-blue text-white rounded-lg hover:bg-walmart-blue-dark transition-colors font-semibold"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Main Content Area */}
      <div className="flex-1 relative bg-gradient-to-br from-white to-gray-50 overflow-hidden">
        {/* Top Navigation Bar */}
        <div className="absolute top-0 left-0 right-0 z-30 bg-white/90 backdrop-blur-sm border-b border-gray-200/50">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold text-walmart-blue">
                {selectedProduct?.title || selectedProduct?.name || 'Product Viewer'}
              </h2>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>AR Ready</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-lg font-bold text-walmart-blue">
                  ${selectedProduct?.price.toFixed(2) || '0.00'}
                </div>
                {selectedProduct?.discountPercentage && selectedProduct.discountPercentage > 0 && (
                  <div className="text-sm text-gray-500 line-through">
                    ${(selectedProduct.price / (1 - selectedProduct.discountPercentage / 100)).toFixed(2)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* AR Viewer Container */}
        <div className="pt-20">
          <ProductViewer
            product={convertToViewerProduct(selectedProduct)}
          />
        </div>
        
        {/* Product Details Panel */}
        <ProductDetails
          product={convertToViewerProduct(selectedProduct)}
          isVisible={showDetails}
          onToggleCart={handleToggleCart}
        />

        {/* Enhanced Background Decorations with better positioning */}
        <div className="absolute top-1/4 right-1/4 w-40 h-40 bg-walmart-blue/8 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/4 w-60 h-60 bg-walmart-yellow/8 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-blue-200/10 rounded-full blur-2xl animate-pulse delay-500"></div>

        {/* Floating Brand Badge with better positioning */}
        <div className="absolute bottom-6 right-6 z-20">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-gray-200/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-walmart-yellow rounded-full flex items-center justify-center">
                <span className="text-walmart-blue font-bold text-sm">✱</span>
              </div>
              <div>
                <div className="font-bold text-walmart-blue text-sm">Walmart AR</div>
                <div className="text-gray-600 text-xs">Powered by 3D Tech</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;