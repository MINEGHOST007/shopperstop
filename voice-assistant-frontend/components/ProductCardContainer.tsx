import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ProductCard, { ProductCardData } from "./ProductCard";
import { useRoomContext, useVoiceAssistant } from "@livekit/components-react";

export default function ProductCardContainer() {
  const [productCards, setProductCards] = useState<ProductCardData[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const room = useRoomContext();
  const { agent } = useVoiceAssistant();

  useEffect(() => {
    if (!room) return;

    // Type guard for RPC data
    const isValidRPCData = (data: unknown): data is { payload: unknown } => {
      return typeof data === 'object' && data !== null && 'payload' in data;
    };

    // Register RPC method to receive product cards
    const handleShowProductCard = async (data: unknown): Promise<string> => {
      try {
        console.log("Received product card RPC data:", data);
        
        if (!isValidRPCData(data) || data.payload === undefined) {
          console.error("Invalid RPC data received:", data);
          return "Error: Invalid RPC data format";
        }
        
        console.log("Parsing payload:", data.payload);
        
        const payload = typeof data.payload === 'string' 
          ? JSON.parse(data.payload) 
          : data.payload;
        
        if (payload.action === "show") {
          const newCard: ProductCardData = {
            id: payload.id,
            product_id: payload.product_id,
            title: payload.title,
            description: payload.description,
            price: payload.price,
            original_price: payload.original_price,
            discount_percentage: payload.discount_percentage,
            category: payload.category,
            rating: payload.rating,
            stock: payload.stock,
            brand: payload.brand,
            image: payload.image,
            tags: payload.tags
          };
          
          setProductCards(prev => {
            const exists = prev.some(card => card.id === newCard.id);
            if (exists) {
              return prev.map(card => 
                card.id === newCard.id ? newCard : card
              );
            } else {
              return [...prev, newCard];
            }
          });
          
          setCurrentCardIndex(payload.index !== undefined ? payload.index : productCards.length);
          setIsVisible(true);
        } else if (payload.action === "hide") {
          setIsVisible(false);
        }
        
        return "Success";
      } catch (error) {
        console.error("Error processing product card data:", error);
        return "Error: " + (error instanceof Error ? error.message : String(error));
      }
    };

    room.localParticipant.registerRpcMethod(
      "client.productcard",
      handleShowProductCard
    );

    return () => {
      room.localParticipant.unregisterRpcMethod("client.productcard");
    };
  }, [room, productCards.length]);

  const handleCardAction = async (id: string, action: string) => {
    try {
      if (agent) {
        console.log(`Sending ${action} request to agent ${agent.identity} for card ID: ${id}`);
        
        const result = await room.localParticipant.performRpc({
          destinationIdentity: agent.identity,
          method: "agent.productCardAction",
          payload: JSON.stringify({ id, action })
        });
        
        console.log(`RPC call result: ${result}`);
      } else {
        console.error("Agent not found in the room");
      }
    } catch (error: unknown) {
      console.error("Error performing card action:", error);
      if (error instanceof Error) {
        console.error(error.stack);
      }
    }
  };

  const currentCard = currentCardIndex !== null && productCards[currentCardIndex] 
    ? productCards[currentCardIndex] 
    : null;

  return (
    <AnimatePresence>
      {isVisible && currentCard && (
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          className="fixed right-8 top-1/4 w-96 bg-gray-900 p-4 rounded-lg shadow-xl z-50 max-h-[80vh] overflow-y-auto"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">Product Recommendation</h2>
            <button 
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-white text-xl"
            >
              ×
            </button>
          </div>
          
          <ProductCard card={currentCard} onAction={handleCardAction} />
          
          {productCards.length > 1 && (
            <div className="flex justify-between items-center mt-4 text-white">
              <button
                onClick={() => setCurrentCardIndex(prev => 
                  prev !== null ? Math.max(0, prev - 1) : 0
                )}
                disabled={currentCardIndex === 0}
                className="px-4 py-2 bg-blue-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
              >
                ← Previous
              </button>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm">
                  {(currentCardIndex ?? 0) + 1} of {productCards.length}
                </span>
                <div className="flex space-x-1">
                  {productCards.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentCardIndex(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentCardIndex ? 'bg-blue-500' : 'bg-gray-500'
                      }`}
                    />
                  ))}
                </div>
              </div>
              
              <button
                onClick={() => setCurrentCardIndex(prev => 
                  prev !== null ? Math.min(productCards.length - 1, prev + 1) : 0
                )}
                disabled={currentCardIndex === productCards.length - 1}
                className="px-4 py-2 bg-blue-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
              >
                Next →
              </button>
            </div>
          )}
          
          {/* Shopping hint */}
          <div className="mt-4 p-3 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-lg border border-green-500/30">
            <p className="text-sm text-green-300 text-center">
              💡 Ask me to find similar products or create a product quiz to discover more items you&apos;ll love!
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 