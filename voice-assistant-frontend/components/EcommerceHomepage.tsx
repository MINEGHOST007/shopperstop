import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, ShoppingCart, Star, Package, Zap, MessageCircle, Grid, List } from "lucide-react";
import Image from "next/image";

interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  category: string;
  brand: string;
  thumbnail: string;
  tags: string[];
}

interface EcommerceHomepageProps {
  onStartConversation: () => void;
}

export default function EcommerceHomepage({ onStartConversation }: EcommerceHomepageProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("featured");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [priceRange, setPriceRange] = useState({ min: 0, max: 2000 });

  // Load products from combined JSON
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetch('/combined-products.json');
        const data = await response.json();
        setProducts(data.products || []);
        setLoading(false);
      } catch (error) {
        console.error('Failed to load products:', error);
        // Fallback to empty array if file not found
        setProducts([]);
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map(p => p.category)));
    return cats.sort();
  }, [products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    const filtered = products.filter(product => {
      const matchesSearch = searchQuery === "" || 
        (product.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.brand || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.tags || []).some(tag => (tag || '').toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
      const matchesPrice = product.price >= priceRange.min && product.price <= priceRange.max;
      
      return matchesSearch && matchesCategory && matchesPrice;
    });

    // Sort products
    switch (sortBy) {
      case "price-low":
        return filtered.sort((a, b) => a.price - b.price);
      case "price-high":
        return filtered.sort((a, b) => b.price - a.price);
      case "rating":
        return filtered.sort((a, b) => b.rating - a.rating);
      case "discount":
        return filtered.sort((a, b) => b.discountPercentage - a.discountPercentage);
      case "name":
        return filtered.sort((a, b) => a.title.localeCompare(b.title));
      default: // featured
        return filtered.sort((a, b) => b.rating * (1 + b.discountPercentage / 100) - a.rating * (1 + a.discountPercentage / 100));
    }
  }, [products, searchQuery, selectedCategory, sortBy, priceRange]);

  const ProductCard = ({ product }: { product: Product }) => {
    const originalPrice = product.discountPercentage > 0 
      ? product.price / (1 - product.discountPercentage / 100) 
      : null;

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -2, scale: 1.01 }}
        className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group cursor-pointer border border-gray-200"
      >
        {/* Product Image */}
        <div className="relative h-48 bg-gray-50">
          <Image 
            src={product.thumbnail} 
            alt={product.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            onError={(e) => {
              e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgNzBWMTMwTTcwIDEwMEgxMzAiIHN0cm9rZT0iIzlDQTNBRiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KPC9zdmc+';
            }}
          />
          
          {/* Rollback/Discount Badge */}
          {product.discountPercentage > 0 && (
            <div className="absolute top-2 left-2 bg-walmart-blue text-white px-2 py-1 rounded text-xs font-bold">
              Rollback
            </div>
          )}
          
          {/* Stock Status */}
          <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium ${
            product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {product.stock > 0 ? 'In stock' : 'Out of stock'}
          </div>
        </div>
        
        {/* Product Info */}
        <div className="p-4">
          {/* Price Section - Walmart style with larger pricing */}
          <div className="mb-2">
            <div className="flex items-baseline space-x-2 mb-1">
              <span className="text-xl font-bold text-gray-900">
                ${product.price.toFixed(2)}
              </span>
              {originalPrice && (
                <span className="text-sm text-gray-500 line-through">
                  ${originalPrice.toFixed(2)}
                </span>
              )}
              {product.discountPercentage > 0 && (
                <span className="text-sm text-green-600 font-medium">
                  Save ${(originalPrice! - product.price).toFixed(2)}
                </span>
              )}
            </div>
            {product.discountPercentage > 0 && (
              <div className="text-xs text-gray-500">
                Was ${originalPrice?.toFixed(2)}
              </div>
            )}
          </div>
          
          <div className="mb-3">
            <h3 className="font-medium text-gray-900 line-clamp-2 text-sm mb-1 leading-snug">
              {product.title}
            </h3>
            <p className="text-xs text-gray-500">{product.brand}</p>
          </div>
          
          {/* Rating */}
          <div className="flex items-center mb-3">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.floor(product.rating) 
                      ? 'text-yellow-400 fill-current' 
                      : 'text-gray-300'
                  }`}
                />
              ))}
              <span className="text-xs text-gray-600 ml-1">
                ({product.rating.toFixed(1)})
              </span>
            </div>
          </div>
          
          {/* Shipping Info */}
          <div className="mb-3 text-xs text-gray-600">
            {product.price >= 35 ? (
              <span className="text-green-600 font-medium">Free shipping</span>
            ) : (
              <span>Shipping calculated at checkout</span>
            )}
          </div>
          
          {/* Add to Cart Button */}
          <button 
            className="w-full bg-walmart-blue hover:bg-walmart-blue-dark text-white py-2.5 px-4 rounded-full font-medium transition-colors flex items-center justify-center text-sm disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
            disabled={product.stock <= 0}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            {product.stock > 0 ? 'Add to cart' : 'Out of stock'}
          </button>
        </div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-walmart-gray flex items-center justify-center font-walmart">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-walmart-blue rounded-full flex items-center justify-center mb-4 animate-pulse">
            <div className="w-8 h-8 bg-walmart-yellow rounded-full flex items-center justify-center">
              <span className="text-walmart-blue font-bold text-lg">✱</span>
            </div>
          </div>
          <p className="text-walmart-dark-gray font-medium">Loading Walmart...</p>
          <p className="text-gray-500 text-sm mt-1">Finding the best deals for you</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-walmart-gray font-walmart">
      {/* Header */}
      <header className="bg-walmart-blue shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center mr-8">
                <div className="w-8 h-8 bg-walmart-yellow rounded-full mr-3 flex items-center justify-center">
                  <span className="text-walmart-blue font-bold text-lg">✱</span>
                </div>
                <h1 className="text-2xl font-bold text-white">Walmart</h1>
              </div>
              {/* Department Links */}
              <nav className="hidden md:flex space-x-6">
                <a href="#" className="text-white hover:text-walmart-yellow text-sm font-medium">Departments</a>
                <a href="#" className="text-white hover:text-walmart-yellow text-sm font-medium">Services</a>
                <a href="#" className="text-white hover:text-walmart-yellow text-sm font-medium">Grocery</a>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative flex-1 max-w-lg">
                <input
                  type="text"
                  placeholder="Search everything at Walmart online and in store"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-4 pr-12 py-2 border-2 border-walmart-yellow rounded-full focus:ring-2 focus:ring-walmart-yellow focus:border-transparent"
                />
                <button className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-walmart-yellow hover:bg-walmart-yellow-dark text-walmart-blue p-2 rounded-full transition-colors">
                  <Search className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center space-x-4">
                <button className="text-white hover:text-walmart-yellow flex flex-col items-center transition-colors">
                  <div className="relative">
                    <ShoppingCart className="w-6 h-6" />
                    <span className="absolute -top-2 -right-2 bg-walmart-yellow text-walmart-blue text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">0</span>
                  </div>
                  <span className="text-xs mt-1">Cart</span>
                </button>
                <button className="text-white hover:text-walmart-yellow flex flex-col items-center transition-colors">
                  <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                  <span className="text-xs mt-1">Account</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Promotional Banner */}
      <div className="bg-walmart-yellow py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center text-walmart-blue font-medium text-sm">
            <Zap className="w-4 h-4 mr-2" />
            Free shipping, free pickup. Shop now with our AI shopping assistant!
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-walmart-gray min-h-screen">
        {/* Hero/Promotion Section */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 bg-gradient-to-r from-walmart-blue to-walmart-blue-dark rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Save big with AI shopping!</h2>
                    <p className="text-blue-100 mb-4">Let Sarah help you find the perfect products with personalized recommendations</p>
                    <button 
                      onClick={onStartConversation}
                      className="bg-walmart-yellow text-walmart-blue px-6 py-2 rounded-full font-medium hover:bg-walmart-yellow-dark transition-colors"
                    >
                      Start Shopping with AI
                    </button>
                  </div>
                  <div className="hidden md:block">
                    <MessageCircle className="w-24 h-24 text-blue-300" />
                  </div>
                </div>
              </div>
              <div className="bg-walmart-yellow rounded-lg p-6">
                <div className="text-center">
                  <Zap className="w-12 h-12 text-walmart-blue mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-walmart-blue mb-2">Free Shipping</h3>
                  <p className="text-walmart-blue text-sm">On orders $35+ or pickup</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex gap-8">
            {/* Filters Sidebar */}
            <div className="w-64 flex-shrink-0">
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <h3 className="text-lg font-semibold mb-4 flex items-center text-walmart-blue">
                  <Filter className="w-5 h-5 mr-2" />
                  Refine Results
                </h3>
                
                {/* Category Filter */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-walmart-dark-gray mb-2">
                    Department
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-walmart-blue focus:border-walmart-blue"
                  >
                    <option value="all">All Departments</option>
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-walmart-dark-gray mb-2">
                    Price Range
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) }))}
                      className="w-20 border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-walmart-blue"
                    />
                    <span className="text-gray-500">-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                      className="w-20 border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-walmart-blue"
                    />
                  </div>
                </div>

                {/* Special Features */}
                <div className="border-t pt-4">
                  <h4 className="font-medium text-walmart-dark-gray mb-3">Special Offers</h4>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 text-walmart-blue focus:ring-walmart-blue" />
                      <span className="ml-2 text-sm text-gray-600">Free shipping</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 text-walmart-blue focus:ring-walmart-blue" />
                      <span className="ml-2 text-sm text-gray-600">On sale</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 text-walmart-blue focus:ring-walmart-blue" />
                      <span className="ml-2 text-sm text-gray-600">Rollback</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {/* Sort and View Controls */}
              <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="text-gray-700 font-medium">
                      {filteredProducts.length} results
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">Sort by:</span>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="border border-gray-300 rounded px-3 py-1 text-sm focus:ring-2 focus:ring-walmart-blue focus:border-walmart-blue"
                      >
                        <option value="featured">Best Match</option>
                        <option value="price-low">Price Low to High</option>
                        <option value="price-high">Price High to Low</option>
                        <option value="rating">Customer Rating</option>
                        <option value="discount">Best Savings</option>
                        <option value="name">Name A-Z</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 rounded ${viewMode === "grid" ? "bg-walmart-blue/10 text-walmart-blue" : "text-gray-500 hover:text-walmart-blue"}`}
                    >
                      <Grid className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 rounded ${viewMode === "list" ? "bg-walmart-blue/10 text-walmart-blue" : "text-gray-500 hover:text-walmart-blue"}`}
                    >
                      <List className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Products Grid */}
              <AnimatePresence>
                {filteredProducts.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white rounded-lg shadow-sm p-12 text-center border border-gray-200"
                  >
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                    <p className="text-gray-500">Try adjusting your filters or search terms</p>
                  </motion.div>
                ) : (
                  <motion.div
                    layout
                    className={`grid gap-4 ${
                      viewMode === "grid" 
                        ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
                        : "grid-cols-1"
                    }`}
                  >
                    {filteredProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Voice Assistant Button */}
      <motion.button
        onClick={onStartConversation}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 bg-walmart-yellow hover:bg-walmart-yellow-dark text-walmart-blue p-4 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 z-50 border-2 border-walmart-blue"
      >
        <div className="flex items-center">
          <MessageCircle className="w-6 h-6" />
          <div className="absolute -top-1 -right-1 bg-walmart-blue text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-pulse">
            AI
          </div>
        </div>
      </motion.button>
    </div>
  );
}