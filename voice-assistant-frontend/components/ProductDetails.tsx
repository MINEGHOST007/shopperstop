/**
 * ProductDetails Component
 * 
 * Detailed product information panel with Walmart styling.
 * Features:
 * - Comprehensive product specifications
 * - Customer ratings and reviews
 * - Add to cart functionality
 * - Walmart blue and yellow theme
 * - Responsive design
 */

import React from 'react';
import { 
  Package, 
  Ruler, 
  Star, 
  ShoppingCart, 
  Heart,
  Share2,
  Truck,
  Shield,
  RotateCcw
} from 'lucide-react';
import { Product } from '../app/types/Product';

interface ProductDetailsProps {
  product: Product;
  isVisible: boolean;
  onToggleCart: () => void;
}

export const ProductDetails: React.FC<ProductDetailsProps> = ({ 
  product, 
  isVisible, 
  onToggleCart 
}) => {
  if (!isVisible) return null;

  // Calculate savings
  const savings = product.price.original - product.price.current;

  // Format price
  const formatPrice = (price: number) => `$${price.toFixed(2)}`;

  // Render star rating
  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={16}
        className={`${
          i < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-walmart-blue text-white p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-blue-200 text-sm font-medium">{product.brand}</span>
                <span className="text-blue-200">•</span>
                <span className="text-blue-200 text-sm">{product.category}</span>
              </div>
              <h2 className="text-2xl font-bold mb-2">{product.name}</h2>
              
              {/* Rating */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center">
                  {renderStars(product.rating.average)}
                </div>
                <span className="text-blue-100 text-sm">
                  {product.rating.average} ({product.rating.count.toLocaleString()} reviews)
                </span>
              </div>
            </div>

            {/* Price Section */}
            <div className="text-right">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-3xl font-bold text-walmart-yellow">
                  {formatPrice(product.price.current)}
                </span>
                {savings > 0 && (
                  <div className="bg-walmart-blue-dark text-white text-xs font-bold px-2 py-1 rounded">
                    Rollback
                  </div>
                )}
              </div>
              {savings > 0 && (
                <div className="text-blue-200 text-sm">
                  <span className="line-through">{formatPrice(product.price.original)}</span>
                  <span className="ml-2">Save {formatPrice(savings)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-3">
            <button className="flex items-center gap-2 text-blue-100 hover:text-white transition-colors">
              <Heart size={16} />
              <span className="text-sm">Save</span>
            </button>
            <button className="flex items-center gap-2 text-blue-100 hover:text-white transition-colors">
              <Share2 size={16} />
              <span className="text-sm">Share</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Description */}
          <p className="text-gray-700 mb-6 leading-relaxed">{product.description}</p>

          {/* Key Features */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Package className="text-blue-600" size={18} />
              Key Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {product.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="text-gray-700 text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Specifications */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Package className="text-blue-600" size={18} />
                Specifications
              </h3>
              <div className="space-y-2">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-1 border-b border-gray-100 last:border-b-0">
                    <span className="text-gray-600 text-sm">{key}:</span>
                    <span className="text-gray-900 text-sm font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Dimensions & Details */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Ruler className="text-walmart-blue" size={18} />
                Product Details
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-600 text-sm">Dimensions:</span>
                  <span className="text-gray-900 text-sm font-medium">
                    {product.dimensions.width} × {product.dimensions.height} × {product.dimensions.depth} {product.dimensions.unit}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-600 text-sm">Weight:</span>
                  <span className="text-gray-900 text-sm font-medium">
                    {product.weight.value} {product.weight.unit}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-600 text-sm">SKU:</span>
                  <span className="text-gray-900 text-sm font-medium">{product.sku}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-600 text-sm">Availability:</span>
                  <span className={`text-sm font-medium ${
                    product.availability.inStock ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {product.availability.inStock 
                      ? `In Stock (${product.availability.quantity})` 
                      : 'Out of Stock'
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Walmart Benefits */}
          <div className="bg-walmart-gray rounded-xl p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <Truck className="text-walmart-blue" size={20} />
                <div>
                  <div className="font-medium text-walmart-dark-gray text-sm">Free Shipping</div>
                  <div className="text-gray-600 text-xs">On orders $35+</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <RotateCcw className="text-walmart-blue" size={20} />
                <div>
                  <div className="font-medium text-walmart-dark-gray text-sm">Free Returns</div>
                  <div className="text-gray-600 text-xs">90-day returns</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="text-walmart-blue" size={20} />
                <div>
                  <div className="font-medium text-walmart-dark-gray text-sm">Protection</div>
                  <div className="text-gray-600 text-xs">Walmart+ benefits</div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={onToggleCart}
              disabled={!product.availability.inStock}
              className={`
                flex-1 font-semibold py-4 px-6 rounded-lg transition-all duration-300 
                transform hover:scale-105 flex items-center justify-center gap-2
                ${product.availability.inStock
                  ? 'bg-walmart-blue hover:bg-walmart-blue-dark text-white shadow-lg'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              <ShoppingCart size={20} />
              {product.availability.inStock ? 'Add to Cart' : 'Out of Stock'}
            </button>
            
            <button className="bg-walmart-yellow hover:bg-walmart-yellow-dark text-walmart-blue font-semibold py-4 px-8 rounded-lg transition-all duration-300 transform hover:scale-105">
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};