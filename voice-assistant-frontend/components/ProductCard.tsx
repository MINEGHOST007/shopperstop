import { motion } from "framer-motion";
import { Star, ShoppingCart, Package, Zap } from "lucide-react";
import Image from "next/image";

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
      className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden border border-gray-200"
    >
      {/* Product Image */}
      <div className="relative h-48 bg-walmart-gray">
        {card.image ? (
          <Image 
            src={card.image} 
            alt={card.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-20 h-20 text-gray-400" />
          </div>
        )}
        
        {/* Discount Badge */}
        {hasDiscount && (
          <div className="absolute top-3 left-3 bg-walmart-blue text-white px-3 py-1 rounded text-sm font-bold">
            Rollback
          </div>
        )}
        
        {/* Stock Status */}
        <div className={`absolute top-3 right-3 px-3 py-1 rounded text-sm font-medium ${
          card.stock > 0 ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {card.stock > 0 ? 'In Stock' : 'Out of Stock'}
        </div>
      </div>
      
      {/* Product Info */}
      <div className="p-4">
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-walmart-dark-gray mb-1 line-clamp-2">
            {card.title}
          </h3>
          <p className="text-sm text-gray-600 mb-1">{card.brand}</p>
          <span className="inline-block px-2 py-1 bg-walmart-blue/10 text-walmart-blue text-xs rounded">
            {card.category}
          </span>
        </div>
        
        {/* Rating */}
        <div className="flex items-center mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(card.rating) 
                    ? 'text-walmart-yellow fill-current' 
                    : 'text-gray-300'
                }`}
              />
            ))}
            <span className="ml-2 text-sm text-gray-600">
              {card.rating.toFixed(1)}
            </span>
          </div>
        </div>
        
        {/* Price */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold text-walmart-dark-gray">
                ${card.price.toFixed(2)}
              </span>
              {card.original_price && (
                <span className="text-sm text-gray-500 line-through">
                  ${card.original_price.toFixed(2)}
                </span>
              )}
            </div>
            {hasDiscount && (
              <div className="flex items-center text-green-600 text-sm">
                <Zap className="w-4 h-4 mr-1" />
                <span className="font-medium">Save ${savings.toFixed(2)}!</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Description */}
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {card.description}
        </p>
        
        {/* Tags */}
        {card.tags && card.tags.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {card.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="inline-block px-2 py-1 bg-walmart-gray text-walmart-dark-gray text-xs rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex space-x-2">
          <button
            onClick={() => onAction(card.id, "select")}
            className="flex-1 bg-walmart-blue hover:bg-walmart-blue-dark text-white px-3 py-2 rounded font-medium transition-colors text-sm"
            disabled={card.stock <= 0}
          >
            {card.stock > 0 ? 'View Product' : 'Out of Stock'}
          </button>
          <button
            onClick={() => onAction(card.id, "add_to_cart")}
            className="bg-walmart-yellow hover:bg-walmart-yellow-dark text-walmart-blue px-3 py-2 rounded font-medium transition-colors"
            disabled={card.stock <= 0}
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Special Offer Banner */}
      {hasDiscount && (
        <div className="bg-walmart-blue text-white p-2 text-center">
          <span className="font-bold text-sm">💰 Rollback! Save {card.discount_percentage.toFixed(0)}%</span>
        </div>
      )}
    </motion.div>
  );
} 