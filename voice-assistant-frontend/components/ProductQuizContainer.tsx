import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRoomContext, useVoiceAssistant } from "@livekit/components-react";
import ProductSelectionQuiz, { ProductQuizItem } from "./ProductSelectionQuiz";
import { Gift, Sparkles } from "lucide-react";
import Image from "next/image";

export default function ProductQuizContainer() {
  const [products, setProducts] = useState<ProductQuizItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [quizId, setQuizId] = useState<string | null>(null);
  const [selections, setSelections] = useState<Record<string, { liked: boolean }>>({});
  const [discountPercentage, setDiscountPercentage] = useState(5);
  const [instructions, setInstructions] = useState<string>("");
  const [showResults, setShowResults] = useState(false);
  const room = useRoomContext();
  const { agent } = useVoiceAssistant();

  useEffect(() => {
    if (!room) return;

    // Type guard for RPC data
    const isValidRPCData = (data: unknown): data is { payload: unknown } => {
      return typeof data === 'object' && data !== null && 'payload' in data;
    };

    // Register RPC method to receive product quizzes
    const handleShowProductQuiz = async (data: unknown): Promise<string> => {
      try {
        console.log("Received product quiz RPC data:", data);
        
        if (!isValidRPCData(data) || data.payload === undefined) {
          console.error("Invalid RPC data received:", data);
          return "Error: Invalid RPC data format";
        }
        
        console.log("Parsing payload:", data.payload);
        
        const payload = typeof data.payload === 'string' 
          ? JSON.parse(data.payload) 
          : data.payload;
        
        if (payload.action === "show") {
          // Reset state for new quiz
          setSelections({});
          setCurrentIndex(0);
          setShowResults(false);
          setQuizId(payload.id);
          setProducts(payload.products || []);
          setDiscountPercentage(payload.discount_percentage || 5);
          setInstructions(payload.instructions || "");
          setIsVisible(true);
        } else if (payload.action === "hide") {
          setIsVisible(false);
        }
        
        return "Success";
      } catch (error) {
        console.error("Error processing product quiz data:", error);
        return "Error: " + (error instanceof Error ? error.message : String(error));
      }
    };

    room.localParticipant.registerRpcMethod(
      "client.productquiz",
      handleShowProductQuiz
    );

    return () => {
      room.localParticipant.unregisterRpcMethod("client.productquiz");
    };
  }, [room]);

  const handleSwipe = (productId: string, liked: boolean) => {
    // Record the selection
    setSelections(prev => ({
      ...prev,
      [productId]: { liked }
    }));

    // Move to next product
    setCurrentIndex(prev => prev + 1);
  };

  const handleQuizComplete = async () => {
    if (!agent || !quizId) return;
    
    try {
      console.log(`Submitting product quiz ${quizId} to agent ${agent.identity}`);
      
      const payload = {
        id: quizId,
        selections: selections
      };
      
      const result = await room.localParticipant.performRpc({
        destinationIdentity: agent.identity,
        method: "agent.submitProductQuiz",
        payload: JSON.stringify(payload)
      });
      
      console.log(`Product quiz submission result: ${result}`);
      
      // Show results summary
      setShowResults(true);
    } catch (error: unknown) {
      console.error("Error submitting product quiz:", error);
      if (error instanceof Error) {
        console.error(error.stack);
      }
    }
  };

  const likedProducts = products.filter(product => selections[product.id]?.liked);
  const earnedDiscount = likedProducts.length >= 3;

  const ResultsView = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 text-center max-w-md mx-auto"
    >
      {earnedDiscount ? (
        <div className="mb-4">
          <div className="relative">
            <Gift className="w-16 h-16 mx-auto text-green-500 mb-4" />
            <Sparkles className="w-6 h-6 absolute top-0 right-1/2 translate-x-8 text-yellow-400" />
          </div>
          <h3 className="text-2xl font-bold text-green-600 mb-2">
            Congratulations! 🎉
          </h3>
          <div className="bg-green-100 border-2 border-green-300 rounded-lg p-4 mb-4">
            <p className="text-lg font-bold text-green-800">
              You&apos;ve earned a {discountPercentage}% discount!
            </p>
            <p className="text-sm text-green-700 mt-1">
              You liked {likedProducts.length} products
            </p>
          </div>
        </div>
      ) : (
        <div className="mb-4">
          <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl">🛍️</span>
          </div>
          <h3 className="text-xl font-bold text-blue-600 mb-2">
            Thanks for your feedback!
          </h3>
          <p className="text-gray-600 mb-4">
            You liked {likedProducts.length} products. Like 3 or more next time to unlock the discount!
          </p>
        </div>
      )}

      {likedProducts.length > 0 && (
        <div className="mb-4">
          <h4 className="font-semibold text-gray-800 mb-2">Your favorites:</h4>
          <div className="space-y-2">
            {likedProducts.slice(0, 3).map((product) => (
              <div key={product.id} className="bg-white rounded-lg p-2 flex items-center text-left">
                {product.image && (
                  <div className="relative w-10 h-10 mr-3">
                    <Image 
                      src={product.image} 
                      alt={product.title}
                      fill
                      className="rounded object-cover"
                      sizes="40px"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{product.title}</p>
                  <p className="text-green-600 font-bold text-sm">${product.price.toFixed(2)}</p>
                </div>
              </div>
            ))}
            {likedProducts.length > 3 && (
              <p className="text-sm text-gray-600">
                +{likedProducts.length - 3} more products
              </p>
            )}
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => setIsVisible(false)}
          className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
        >
          Close
        </button>
        <button
          onClick={() => {
            setIsVisible(false);
            // Could trigger another action here, like showing similar products
          }}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Show Similar
        </button>
      </div>
    </motion.div>
  );

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          className="fixed left-8 top-1/4 w-96 bg-gray-900 p-4 rounded-lg shadow-xl z-50 max-h-[80vh] overflow-y-auto"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white flex items-center">
              <span className="mr-2">🛍️</span>
              Product Discovery Quiz
            </h2>
            <button 
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-white text-xl"
            >
              ×
            </button>
          </div>
          
          {showResults ? (
            <ResultsView />
          ) : (
            products.length > 0 && (
              <ProductSelectionQuiz
                products={products}
                currentIndex={currentIndex}
                onSwipe={handleSwipe}
                onComplete={handleQuizComplete}
                discountPercentage={discountPercentage}
                instructions={instructions}
              />
            )
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
} 