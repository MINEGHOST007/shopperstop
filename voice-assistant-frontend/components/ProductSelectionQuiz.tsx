import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { useState } from "react";
import { Heart, X, Star, Package, ShoppingBag } from "lucide-react";
import Image from "next/image";

export interface ProductQuizItem {
  id: string;
  product_id: number;
  title: string;
  description: string;
  price: number;
  image?: string;
  category: string;
  rating: number;
  discount_percentage: number;
  brand?: string;
}

interface ProductSelectionQuizProps {
  products: ProductQuizItem[];
  currentIndex: number;
  onSwipe: (productId: string, liked: boolean) => void;
  onComplete: () => void;
  discountPercentage: number;
  instructions?: string;
}

export default function ProductSelectionQuiz({ 
  products, 
  currentIndex, 
  onSwipe, 
  onComplete,
  discountPercentage,
  instructions 
}: ProductSelectionQuizProps) {
  const [dragDirection, setDragDirection] = useState<'left' | 'right' | null>(null);

  if (currentIndex >= products.length) {
    return (
      <div className="w-full max-w-md mx-auto bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-6 text-center">
        <div className="mb-4">
          <ShoppingBag className="w-16 h-16 mx-auto text-green-500 mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">Quiz Complete!</h3>
          <p className="text-gray-600 mb-4">
            Thanks for sharing your preferences. I&apos;ll use this to help you find amazing products!
          </p>
          <button
            onClick={onComplete}
            className="bg-green-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-600 transition-colors"
          >
            See Results
          </button>
        </div>
      </div>
    );
  }

  const currentProduct = products[currentIndex];
  
  const handleDragEnd = (_event: unknown, info: PanInfo) => {
    const threshold = 100;
    
    if (info.offset.x > threshold) {
      // Swiped right - like
      onSwipe(currentProduct.id, true);
      setDragDirection(null);
    } else if (info.offset.x < -threshold) {
      // Swiped left - dislike
      onSwipe(currentProduct.id, false);
      setDragDirection(null);
    } else {
      setDragDirection(null);
    }
  };

  const handleDrag = (_event: unknown, info: PanInfo) => {
    if (info.offset.x > 50) {
      setDragDirection('right');
    } else if (info.offset.x < -50) {
      setDragDirection('left');
    } else {
      setDragDirection(null);
    }
  };

  const handleLike = () => {
    onSwipe(currentProduct.id, true);
  };

  const handleDislike = () => {
    onSwipe(currentProduct.id, false);
  };

  const formatPrice = (price: number) => `$${price.toFixed(2)}`;

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
      );
    }
    
    if (rating % 1 !== 0) {
      stars.push(
        <Star key="half" className="w-4 h-4 fill-yellow-400/50 text-yellow-400" />
      );
    }
    
    const remaining = 5 - Math.ceil(rating);
    for (let i = 0; i < remaining; i++) {
      stars.push(
        <Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />
      );
    }
    
    return stars;
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {instructions && (
        <div className="bg-blue-50 p-3 rounded-lg mb-4 text-center">
          <p className="text-sm text-blue-700">{instructions}</p>
          <p className="text-xs text-blue-600 mt-1">
            Like 3+ products to unlock {discountPercentage}% discount!
          </p>
        </div>
      )}

      <div className="relative h-[500px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentProduct.id}
            className={`absolute w-full bg-white rounded-xl shadow-2xl overflow-hidden cursor-grab active:cursor-grabbing ${
              dragDirection === 'right' ? 'border-4 border-green-400' : 
              dragDirection === 'left' ? 'border-4 border-red-400' : 'border border-gray-200'
            }`}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ 
              x: dragDirection === 'right' ? 300 : dragDirection === 'left' ? -300 : 0,
              opacity: 0,
              transition: { duration: 0.3 }
            }}
            whileDrag={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Swipe Indicators */}
            <AnimatePresence>
              {dragDirection === 'right' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute top-4 left-4 z-10 bg-green-500 text-white px-3 py-1 rounded-full font-bold text-sm flex items-center"
                >
                  <Heart className="w-4 h-4 mr-1 fill-current" />
                  LIKE
                </motion.div>
              )}
              {dragDirection === 'left' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute top-4 right-4 z-10 bg-red-500 text-white px-3 py-1 rounded-full font-bold text-sm flex items-center"
                >
                  <X className="w-4 h-4 mr-1" />
                  PASS
                </motion.div>
              )}
            </AnimatePresence>

            {/* Product Image */}
            <div className="relative h-64">
              {currentProduct.image ? (
                <Image
                  src={currentProduct.image}
                  alt={currentProduct.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <Package className="w-16 h-16 text-gray-400" />
                </div>
              )}
              
              {/* Discount Badge */}
              {currentProduct.discount_percentage > 0 && (
                <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-sm font-bold">
                  -{currentProduct.discount_percentage.toFixed(0)}%
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold flex-1 line-clamp-2">{currentProduct.title}</h3>
                <div className="text-right ml-2">
                  <div className="text-xl font-bold text-green-600">
                    {formatPrice(currentProduct.price)}
                  </div>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center mb-2">
                <div className="flex items-center mr-2">
                  {renderStars(currentProduct.rating)}
                </div>
                <span className="text-sm text-gray-600">
                  {currentProduct.rating.toFixed(1)}
                </span>
              </div>

              {/* Category and Brand */}
              <div className="flex justify-between items-center text-sm text-gray-600 mb-3">
                <span className="capitalize bg-gray-100 px-2 py-1 rounded-full">
                  {currentProduct.category}
                </span>
                {currentProduct.brand && (
                  <span className="font-medium">{currentProduct.brand}</span>
                )}
              </div>

              {/* Description */}
              <p className="text-sm text-gray-700 line-clamp-3 mb-4">
                {currentProduct.description}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="absolute bottom-[-60px] left-1/2 transform -translate-x-1/2 flex space-x-4">
          <button
            onClick={handleDislike}
            className="bg-red-500 text-white p-4 rounded-full shadow-lg hover:bg-red-600 transition-colors hover:scale-110 transform"
          >
            <X className="w-6 h-6" />
          </button>
          <button
            onClick={handleLike}
            className="bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-colors hover:scale-110 transform"
          >
            <Heart className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="mt-16 flex justify-center">
        <div className="flex space-x-2">
          {products.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index < currentIndex ? 'bg-green-500' : 
                index === currentIndex ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
        <p className="text-sm text-gray-600 ml-4">
          {currentIndex + 1} of {products.length}
        </p>
      </div>
    </div>
  );
} 