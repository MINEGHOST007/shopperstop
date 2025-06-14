import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRoomContext } from "@livekit/components-react";
import { ShoppingBag, Star, Tag, Package } from "lucide-react";
import Image from "next/image";

interface ProductGridItem {
  id: number;
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

interface ProductGridData {
  title: string;
  products: ProductGridItem[];
}

export default function ProductVisualizationPanel() {
  const [productGrid, setProductGrid] = useState<ProductGridData | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isInitialRender, setIsInitialRender] = useState(true);
  const [lastUpdateTime, setLastUpdateTime] = useState(0);
  const room = useRoomContext();
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Type guard for RPC data
  const isValidRPCData = (data: unknown): data is { payload: unknown } => {
    return typeof data === 'object' && data !== null && 'payload' in data;
  };

  // Register RPC method to receive product grids
  const handleShowProductGrid = useCallback(async (data: unknown): Promise<string> => {
    try {
      console.log("Received product grid RPC data:", data);
      
      if (!isValidRPCData(data) || data.payload === undefined) {
        console.error("Invalid RPC data received:", data);
        return "Error: Invalid RPC data format";
      }
      
      const payload = typeof data.payload === 'string' 
        ? JSON.parse(data.payload) 
        : data.payload;
      
      console.log("Parsed payload:", payload);
      
      // Prevent rapid updates
      const now = Date.now();
      if (now - lastUpdateTime < 500) { // Throttle updates to max once per 500ms
        console.log("Throttling update - too soon since last update");
        return "Success (throttled)";
      }
      
      if (payload.action === "show_grid") {
        console.log("Setting product grid with", payload.products?.length, "products");
        
        // Clear any pending timeout
        if (updateTimeoutRef.current) {
          clearTimeout(updateTimeoutRef.current);
        }
        
        // Debounce the update
        updateTimeoutRef.current = setTimeout(() => {
          setProductGrid({
            title: payload.title,
            products: payload.products || []
          });
          setIsVisible(true);
          setLastUpdateTime(Date.now());
          setIsInitialRender(false);
          console.log("Product grid state updated successfully");
        }, 100);
        
      } else if (payload.action === "hide_grid") {
        setIsVisible(false);
        console.log("Product grid hidden");
      }
      
      return "Success";
    } catch (error) {
      console.error("Error processing product grid data:", error);
      return "Error: " + (error instanceof Error ? error.message : String(error));
    }
  }, [lastUpdateTime]);

  useEffect(() => {
    if (!room) return;

    room.localParticipant.registerRpcMethod(
      "client.productgrid",
      handleShowProductGrid
    );

    return () => {
      room.localParticipant.unregisterRpcMethod("client.productgrid");
      // Cleanup timeout on unmount
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [room, handleShowProductGrid]);

  const ProductGridCard = useCallback(({ product }: { product: ProductGridItem }) => (
    <motion.div
      initial={isInitialRender ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -5 }}
      className="bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 overflow-hidden group"
    >
      {/* Product Image */}
      <div className="relative h-48 bg-gray-50">
        {product.image ? (
          <Image 
            src={product.image} 
            alt={product.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-16 h-16 text-gray-400" />
          </div>
        )}
        
        {/* Rollback Badge */}
        {product.discount_percentage > 0 && (
          <div className="absolute top-2 left-2 bg-yellow-400 text-blue-900 px-2 py-1 rounded-full text-xs font-bold">
            Rollback
          </div>
        )}
        
        {/* Stock Badge */}
        <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${
          product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {product.stock > 0 ? `${product.stock} left` : 'Out of stock'}
        </div>
      </div>
      
      {/* Product Info */}
      <div className="p-4">
        <div className="mb-2">
          <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm mb-1">
            {product.title}
          </h3>
          <p className="text-xs text-gray-500 mb-2">{product.brand}</p>
        </div>
        
        {/* Rating */}
        <div className="flex items-center mb-2">
          <div className="flex items-center">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm text-gray-600 ml-1">
              {product.rating.toFixed(1)}
            </span>
          </div>
          <span className="text-xs text-gray-500 ml-2">
            {product.category}
          </span>
        </div>
        
        {/* Price */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-blue-900">
              ${product.price.toFixed(2)}
            </span>
            {product.original_price && (
              <span className="text-sm text-gray-500 line-through">
                ${product.original_price.toFixed(2)}
              </span>
            )}
          </div>
          {product.discount_percentage > 0 && (
            <div className="flex items-center text-yellow-600">
              <span className="text-sm font-bold bg-yellow-100 px-2 py-1 rounded-full">
                Save ${((product.original_price || product.price) - product.price).toFixed(2)}
              </span>
            </div>
          )}
        </div>
        
        {/* Tags */}
        {product.tags && product.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {product.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-50 text-blue-800"
              >
                <Tag className="w-3 h-3 mr-1" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  ), [isInitialRender]);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4" style={{ backgroundColor: '#0071ce' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <ShoppingBag className="w-6 h-6 mr-2" />
            <h2 className="text-xl font-bold">Product Showcase</h2>
          </div>
          {productGrid && (
            <button
              onClick={() => setIsVisible(false)}
              className="text-white hover:text-yellow-300 text-xl bg-yellow-500 hover:bg-yellow-600 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
              style={{ backgroundColor: '#ffc220' }}
            >
              ×
            </button>
          )}
        </div>
        {productGrid && (
          <p className="text-blue-100 mt-1">{productGrid.title}</p>
        )}
      </div>
      
      {/* Content Area */}
      <div className="flex-1 overflow-auto p-4">
        <AnimatePresence mode="wait">
          {isVisible && productGrid ? (
            <motion.div
              key="product-grid" 
              initial={isInitialRender ? { opacity: 0 } : { opacity: 1 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-max">
                {productGrid.products.map((product, index) => (
                  <motion.div
                    key={`${product.id}-${index}`}
                    initial={isInitialRender ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      delay: isInitialRender ? index * 0.05 : 0,
                      duration: 0.3
                    }}
                  >
                    <ProductGridCard product={product} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="h-full flex items-center justify-center"
            >
              <div className="text-center text-gray-500">
                <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-semibold mb-2">Ready to Shop!</h3>
                <p className="text-gray-400 max-w-md">
                  Start chatting with Sarah to discover amazing products. 
                  She&apos;ll show you personalized recommendations right here!
                </p>
                <div className="mt-6 grid grid-cols-2 gap-4 max-w-sm mx-auto text-sm">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <span className="font-medium text-blue-800">Try saying:</span>
                    <p className="text-blue-600 mt-1">&quot;Show me laptops under $1000&quot;</p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <span className="font-medium text-purple-800">Or ask for:</span>
                    <p className="text-purple-600 mt-1">&quot;Beauty products with discounts&quot;</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
} 