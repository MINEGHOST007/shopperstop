import { motion } from "framer-motion";
import { Star, ShoppingCart, Heart, Info, Package, Zap } from "lucide-react";

export interface ProductCardData {
  id: string;
  product_id: number;
  title: string;
  description: string;
  price: number;
  original_price?: number;
  discount_percentage: number;
  category: string;
  rating: number;
  stock: number;
  brand: string;
  image: string;
  tags: string[];
}

interface ProductCardProps {
  card: ProductCardData;
  onAction: (id: string, action: string) => void;
}

export default function ProductCard({ card, onAction }: ProductCardProps) {
  const hasDiscount = card.discount_percentage > 0;
  const savings = card.original_price ? card.original_price - card.price : 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden"
    >
      {/* Product Image */}
      <div className="relative h-64 bg-gray-100">
        {card.image ? (
          <img 
            src={card.image} 
            alt={card.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-20 h-20 text-gray-400" />
          </div>
        )}
        
        {/* Discount Badge */}
        {hasDiscount && (
          <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
            -{card.discount_percentage.toFixed(0)}% OFF
          </div>
        )}
        
        {/* Stock Status */}
        <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-sm font-medium ${
          card.stock > 0 ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {card.stock > 0 ? 'In Stock' : 'Out of Stock'}
        </div>
      </div>
      
      {/* Product Info */}
      <div className="p-6">
        <div className="mb-3">
          <h3 className="text-xl font-bold text-gray-900 mb-1 line-clamp-2">
            {card.title}
          </h3>
          <p className="text-sm text-gray-600 mb-1">{card.brand}</p>
          <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
            {card.category}
          </span>
        </div>
        
        {/* Rating */}
        <div className="flex items-center mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-5 h-5 ${
                  i < Math.floor(card.rating) 
                    ? 'text-yellow-400 fill-current' 
                    : 'text-gray-300'
                }`}
              />
            ))}
            <span className="ml-2 text-sm text-gray-600">
              {card.rating.toFixed(1)} stars
            </span>
          </div>
        </div>
        
        {/* Price */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-gray-900">
                ${card.price.toFixed(2)}
              </span>
              {card.original_price && (
                <span className="text-lg text-gray-500 line-through">
                  ${card.original_price.toFixed(2)}
                </span>
              )}
            </div>
            {hasDiscount && (
              <div className="flex items-center text-green-600">
                <Zap className="w-5 h-5 mr-1" />
                <span className="font-medium">Save ${savings.toFixed(2)}!</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Description */}
        <p className="text-gray-700 text-sm mb-4 line-clamp-3">
          {card.description}
        </p>
        
        {/* Tags */}
        {card.tags && card.tags.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {card.tags.slice(0, 4).map((tag, index) => (
                <span
                  key={index}
                  className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                >
                  #{tag}
                </span>
              ))}
              {card.tags.length > 4 && (
                <span className="text-xs text-gray-500 px-2 py-1">
                  +{card.tags.length - 4} more
                </span>
              )}
            </div>
          </div>
        )}
        
        {/* Stock Info */}
        <div className="mb-4 text-sm text-gray-600">
          <span className="font-medium">Stock:</span> {card.stock} units available
        </div>
        
        {/* Action Buttons */}
        <div className="flex space-x-2">
          <button
            onClick={() => onAction(card.id, "like")}
            className="flex-1 bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center"
          >
            <Heart className="w-4 h-4 mr-2" />
            Like
          </button>
          <button
            onClick={() => onAction(card.id, "add_to_cart")}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center"
            disabled={card.stock <= 0}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            {card.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
          </button>
          <button
            onClick={() => onAction(card.id, "more_info")}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Special Offer Banner */}
      {hasDiscount && (
        <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white p-3 text-center">
          <span className="font-bold">🔥 Limited Time Offer! Save {card.discount_percentage.toFixed(0)}% Today!</span>
        </div>
      )}
    </motion.div>
  );
} 