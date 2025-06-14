/**
 * ProductCard Component
 * 
 * Displays individual product information in a card format with:
 * - Product image with hover effects
 * - Pricing with discount indicators
 * - Rating display
 * - Stock status
 * - Walmart-themed styling
 */

import React from 'react';
import { Star, ShoppingCart, Eye } from 'lucide-react';
import { Product } from '../app/types/Product';
import Image from 'next/image';

interface ProductCardProps {
  product: Product;
  isSelected: boolean;
  onClick: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  isSelected, 
  onClick 
}) => {
  // Calculate discount percentage for display
  const discountPercentage = Math.round(
    ((product.price.original - product.price.current) / product.price.original) * 100
  );

  // Format price for display
  const formatPrice = (price: number) => `$${price.toFixed(2)}`;

  // Get stock status styling
  const getStockStatus = () => {
    if (!product.availability.inStock) {
      return { text: 'Out of Stock', color: 'text-red-400' };
    }
    if (product.availability.quantity < 10) {
      return { text: 'Low Stock', color: 'text-yellow-400' };
    }
    return { text: 'In Stock', color: 'text-green-400' };
  };

  const stockStatus = getStockStatus();

  return (
    <div
      onClick={onClick}
      className={`
        group cursor-pointer transition-all duration-300 transform hover:scale-105
        bg-white rounded-2xl border-2 shadow-lg hover:shadow-2xl
        ${isSelected 
          ? 'ring-4 ring-blue-500 border-blue-500 shadow-blue-500/20' 
          : 'border-gray-200 hover:border-blue-300'
        }
        overflow-hidden
      `}
    >
      {/* Product Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <Image
          src={product.assets.primaryImage}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          onError={(e) => {
            // Fallback to Pexels image if product image fails to load
            const target = e.target as HTMLImageElement;
            target.src = 'https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg?auto=compress&cs=tinysrgb&w=800';
          }}
        />
        
        {/* Discount Badge */}
        {discountPercentage > 0 && (
          <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            -{discountPercentage}%
          </div>
        )}

        {/* Quick Actions */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-lg">
            <Eye size={16} className="text-gray-700" />
          </button>
          <button className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-lg">
            <ShoppingCart size={16} />
          </button>
        </div>

        {/* Stock Status Overlay */}
        <div className={`absolute bottom-3 left-3 text-xs font-medium ${stockStatus.color}`}>
          {stockStatus.text}
        </div>
      </div>
      
      {/* Product Information */}
      <div className="p-4 space-y-3">
        {/* Brand and Category */}
        <div className="flex justify-between items-start text-xs">
          <span className="text-blue-600 font-medium">{product.brand}</span>
          <span className="text-gray-500">{product.category}</span>
        </div>

        {/* Product Name */}
        <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">
          {product.name}
        </h3>
        
        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={12}
                className={`${
                  i < Math.floor(product.rating.average)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-600">
            {product.rating.average} ({product.rating.count})
          </span>
        </div>

        {/* Pricing */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-900">
              {formatPrice(product.price.current)}
            </span>
            {product.price.original > product.price.current && (
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(product.price.original)}
              </span>
            )}
          </div>
        </div>

        {/* Key Features */}
        <div className="pt-2 border-t border-gray-100">
          <div className="flex flex-wrap gap-1">
            {product.features.slice(0, 2).map((feature: string, index: number) => (
              <span
                key={index}
                className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
              >
                {feature}
              </span>
            ))}
            {product.features.length > 2 && (
              <span className="text-xs text-gray-500">
                +{product.features.length - 2} more
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};