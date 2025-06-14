import useCombinedTranscriptions from "@/hooks/useCombinedTranscriptions";
import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, User, MessageCircle } from "lucide-react";

export default function TranscriptionView() {
  const combinedTranscriptions = useCombinedTranscriptions();
  const containerRef = React.useRef<HTMLDivElement>(null);

  // scroll to bottom when new transcription is added
  React.useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [combinedTranscriptions]);

  return (
    <div className="relative h-[400px] w-full flex flex-col bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MessageCircle className="w-5 h-5 text-white" />
          <h3 className="text-white font-semibold">Chat with Sarah</h3>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-white text-sm">Online</span>
        </div>
      </div>

      {/* Chat Messages */}
      <div 
        ref={containerRef} 
        className="flex-1 flex flex-col gap-3 overflow-y-auto p-4 bg-gray-900 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800"
      >
        <AnimatePresence initial={false}>
          {combinedTranscriptions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-full text-gray-400"
            >
              <Bot className="w-12 h-12 mb-3 text-gray-500" />
              <p className="text-center text-sm">
                Start speaking with Sarah!<br />
                <span className="text-xs text-gray-500">She'll help you find amazing products</span>
              </p>
            </motion.div>
          ) : (
            combinedTranscriptions.map((segment, index) => (
              <motion.div
                key={segment.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex gap-3"
              >
                {segment.role === "assistant" ? (
                  <>
                    {/* Sarah's Avatar */}
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    {/* Sarah's Message */}
                    <div className="flex-1">
                      <div className="bg-gray-700 text-gray-100 rounded-lg rounded-bl-sm px-4 py-2 max-w-[85%]">
                        <p className="text-sm leading-relaxed">{segment.text}</p>
                      </div>
                      <div className="flex items-center mt-1 ml-2">
                        <span className="text-xs text-gray-500">Sarah</span>
                        <span className="text-xs text-gray-600 ml-2">AI Assistant</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* User's Message */}
                    <div className="flex-1 flex justify-end">
                      <div className="max-w-[85%]">
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg rounded-br-sm px-4 py-2">
                          <p className="text-sm leading-relaxed">{segment.text}</p>
                        </div>
                        <div className="flex items-center justify-end mt-1 mr-2">
                          <span className="text-xs text-gray-500">You</span>
                        </div>
                      </div>
                    </div>
                    {/* User's Avatar */}
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Chat Footer */}
      <div className="bg-gray-800 px-4 py-2 border-t border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-gray-400">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <span>Voice conversation active</span>
          </div>
          <div className="text-xs text-gray-500">
            {combinedTranscriptions.length} messages
          </div>
        </div>
      </div>
    </div>
  );
}
