/**
 * Main App Component - Walmart AR Product Viewer
 * 
 * Redesigned to match the voice assistant layout with:
 * - Left panel: Static AR assistant with product search and selection
 * - Right panel: AR viewer and product details
 * - Clean, modern UI consistent with voice assistant
 */

'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, ArrowLeft, Sparkles, Eye, Package, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [cartItems, setCartItems] = useState<string[]>([]);
  const [showDetails, setShowDetails] = useState(true);

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
    } else {
      setCartItems([...cartItems, productId]);
    }
  };

  // Handle back to main page
  const handleBackToHome = () => {
    window.location.href = '/';
  };

  if (!selectedProduct && products.length === 0) {
    return (
      <div className="min-h-screen bg-walmart-gray flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-walmart-blue rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <div className="w-12 h-12 bg-walmart-yellow rounded-full flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-walmart-blue" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-walmart-dark-gray mb-3">AR Product Viewer</h2>
          <p className="text-gray-600 mb-6">Loading AR-enabled products...</p>
        </div>
      </div>
    );
  }

  return (
    <main data-lk-theme="default" className="min-h-screen bg-walmart-gray font-walmart">
      <div className="h-screen w-full flex">
        {/* Left Panel - AR Assistant & Product Selection */}
        <div className="w-1/3 min-w-[400px] flex flex-col border-r border-gray-200 bg-white shadow-lg">
          {/* Header with Back Button - Walmart Style */}
          <div className="bg-walmart-blue p-4 border-b border-walmart-blue-dark">
            <div className="flex items-center justify-between">
              <button
                onClick={handleBackToHome}
                className="flex items-center text-white hover:text-walmart-yellow transition-colors font-medium"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Shop
              </button>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-walmart-yellow rounded-full mr-2 flex items-center justify-center">
                  <Eye className="text-walmart-blue w-4 h-4" />
                </div>
                <h2 className="text-white font-semibold">AR Assistant</h2>
              </div>
            </div>
          </div>
          
          {/* Assistant Status Bar */}
          <div className="bg-walmart-yellow/10 border-b border-walmart-yellow/20 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                <span className="text-walmart-blue text-sm font-medium">AR Viewer Ready</span>
              </div>
              <div className="text-xs text-walmart-dark-gray">
                {filteredProducts.length} Products Available
              </div>
            </div>
          </div>

          {/* AR Assistant Avatar & Info */}
          <div className="p-6 border-b border-gray-200 bg-gradient-to-br from-walmart-gray/30 to-white">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-walmart-blue to-walmart-blue-dark rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                <div className="w-10 h-10 bg-walmart-yellow rounded-full flex items-center justify-center">
                  <Eye className="text-walmart-blue w-5 h-5" />
                </div>
              </div>
              <h3 className="font-bold text-walmart-dark-gray text-lg mb-1">AR Shopping Assistant</h3>
              <p className="text-gray-600 text-sm mb-4">Browse products in augmented reality</p>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-center mb-1">
                    <Package className="w-4 h-4 text-walmart-blue mr-1" />
                    <span className="text-lg font-bold text-walmart-blue">{products.length}</span>
                  </div>
                  <div className="text-xs text-gray-600">AR Products</div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-center mb-1">
                    <ShoppingCart className="w-4 h-4 text-walmart-yellow mr-1" />
                    <span className="text-lg font-bold text-walmart-blue">{cartItems.length}</span>
                  </div>
                  <div className="text-xs text-gray-600">In Cart</div>
                </div>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search AR products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-walmart-blue/20 focus:border-walmart-blue text-sm"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="p-4 border-b border-gray-200">
            <h4 className="font-semibold text-walmart-dark-gray mb-3 text-sm">Categories</h4>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    selectedCategory === category
                      ? 'bg-walmart-blue text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Product List */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-walmart-dark-gray text-sm">
                Products ({filteredProducts.length})
              </h4>
              {selectedProduct && (
                <div className="text-xs text-green-600 font-medium">
                  ● {selectedProduct.title || selectedProduct.name}
                </div>
              )}
            </div>
            
            <div className="space-y-3">
              {filteredProducts.map((product) => {
                const isSelected = selectedProduct?.id === product.id;
                return (
                  <motion.div
                    key={product.id}
                    layout
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-walmart-blue bg-walmart-blue/5 shadow-md' 
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }`}
                    onClick={() => handleProductSelect(product)}
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={product.thumbnail}
                        alt={product.title || product.name}
                        className="w-12 h-12 object-cover rounded-lg bg-gray-100"
                        onError={(e) => {
                          e.currentTarget.src = '/assets/images/iphoneX.png';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <h5 className="font-medium text-sm text-walmart-dark-gray truncate">
                          {product.title || product.name}
                        </h5>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                          <span className="text-xs text-gray-600">{product.rating}</span>
                        </div>
                        <div className="text-sm font-bold text-walmart-blue mt-1">
                          ${product.price.toFixed(2)}
                        </div>
                      </div>
                      {isSelected && (
                        <div className="w-2 h-2 bg-walmart-blue rounded-full"></div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-8">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No products found</p>
                <button 
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                  }}
                  className="text-walmart-blue text-sm mt-2 hover:underline"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Right Panel - AR Viewer */}
        <div className="flex-1 bg-white">
          <div className="h-full flex flex-col">
            {/* Right Panel Header */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-walmart-dark-gray">
                    {selectedProduct ? (selectedProduct.title || selectedProduct.name) : 'AR Product Viewer'}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedProduct ? 'View this product in augmented reality' : 'Select a product to view in AR'}
                  </p>
                </div>
                {selectedProduct && (
                  <div className="text-right">
                    <div className="text-xl font-bold text-walmart-blue">
                      ${selectedProduct.price.toFixed(2)}
                    </div>
                    {selectedProduct.discountPercentage && selectedProduct.discountPercentage > 0 && (
                      <div className="text-sm text-gray-500 line-through">
                        ${(selectedProduct.price / (1 - selectedProduct.discountPercentage / 100)).toFixed(2)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* AR Viewer Container */}
            <div className="flex-1 relative">
              {selectedProduct ? (
                <>
                  <ProductViewer
                    product={convertToViewerProduct(selectedProduct)}
                  />
                  
                  {/* Product Details Panel */}
                  <ProductDetails
                    product={convertToViewerProduct(selectedProduct)}
                    isVisible={showDetails}
                    onToggleCart={handleToggleCart}
                  />
                  
                  {/* Toggle Details Button */}
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium text-walmart-blue hover:bg-white transition-all shadow-sm"
                  >
                    {showDetails ? 'Hide Details' : 'Show Details'}
                  </button>
                </>
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-50">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Eye className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">Select a Product</h3>
                    <p className="text-gray-500">Choose a product from the left panel to view in AR</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default App;