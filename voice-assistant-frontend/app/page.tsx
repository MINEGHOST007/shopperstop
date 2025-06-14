"use client";

import { CloseIcon } from "@/components/CloseIcon";
import { NoAgentNotification } from "@/components/NoAgentNotification";
import TranscriptionView from "@/components/TranscriptionView";
import ProductCardContainer from "@/components/ProductCardContainer";
import ProductQuizContainer from "@/components/ProductQuizContainer";
import ProductVisualizationPanel from "@/components/ProductVisualizationPanel";
import EcommerceHomepage from "@/components/EcommerceHomepage";
import {
  BarVisualizer,
  RoomAudioRenderer,
  RoomContext,
  VideoTrack,
  VoiceAssistantControlBar,
  useVoiceAssistant,
} from "@livekit/components-react";
import { AnimatePresence, motion } from "framer-motion";
import { Room, RoomEvent } from "livekit-client";
import { useCallback, useEffect, useState } from "react";
import type { ConnectionDetails } from "./api/connection-details/route";

export default function Page() {
  const [room] = useState(new Room());
  const [mode, setMode] = useState<"ecommerce" | "voice-assistant">("ecommerce");

  const onConnectButtonClicked = useCallback(async () => {
    // Switch to voice assistant mode first
    setMode("voice-assistant");
    
    // Generate room connection details, including:
    //   - A random Room name
    //   - A random Participant name
    //   - An Access Token to permit the participant to join the room
    //   - The URL of the LiveKit server to connect to
    //
    // In real-world application, you would likely allow the user to specify their
    // own participant name, and possibly to choose from existing rooms to join.

    const url = new URL(
      process.env.NEXT_PUBLIC_CONN_DETAILS_ENDPOINT ?? "/api/connection-details",
      window.location.origin
    );
    const response = await fetch(url.toString());
    const connectionDetailsData: ConnectionDetails = await response.json();

    await room.connect(connectionDetailsData.serverUrl, connectionDetailsData.participantToken);
    await room.localParticipant.setMicrophoneEnabled(true);
  }, [room]);

  const onDisconnectButtonClicked = useCallback(async () => {
    await room.disconnect();
    setMode("ecommerce");
  }, [room]);

  useEffect(() => {
    room.on(RoomEvent.MediaDevicesError, onDeviceFailure);
    room.on(RoomEvent.Disconnected, () => {
      setMode("ecommerce");
    });

    return () => {
      room.off(RoomEvent.MediaDevicesError, onDeviceFailure);
    };
  }, [room]);

  return (
    <main data-lk-theme="default" className="min-h-screen bg-walmart-gray font-walmart">
      <RoomContext.Provider value={room}>
        <div className="h-full w-full">
          {mode === "ecommerce" ? (
            <EcommerceHomepage onStartConversation={onConnectButtonClicked} />
          ) : (
            <SimpleVoiceAssistant 
              onConnectButtonClicked={onConnectButtonClicked}
              onBackToEcommerce={() => setMode("ecommerce")}
              onDisconnect={onDisconnectButtonClicked}
            />
          )}
        </div>
      </RoomContext.Provider>
    </main>
  );
}

function SimpleVoiceAssistant(props: { 
  onConnectButtonClicked: () => void; 
  onBackToEcommerce: () => void;
  onDisconnect: () => void;
}) {
  const { state: agentState } = useVoiceAssistant();

  return (
    <>
      <AnimatePresence mode="wait">
        {agentState === "disconnected" ? (
          <motion.div
            key="disconnected"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.09, 1.04, 0.245, 1.055] }}
            className="flex items-center justify-center h-full bg-walmart-gray"
          >
            <div className="text-center max-w-md mx-auto p-8">
              <div className="w-20 h-20 bg-walmart-blue rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <div className="w-12 h-12 bg-walmart-yellow rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-walmart-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-walmart-dark-gray mb-3">Voice Shopping Assistant</h2>
              <p className="text-gray-600 mb-6">Start a conversation with Sarah to find products, get recommendations, and discover great deals using your voice.</p>
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="bg-walmart-blue hover:bg-walmart-blue-dark text-white px-8 py-4 rounded-full font-medium transition-all duration-300 shadow-lg hover:shadow-xl flex items-center mx-auto"
                onClick={() => props.onConnectButtonClicked()}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                Start Voice Shopping
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="connected"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: [0.09, 1.04, 0.245, 1.055] }}
            className="flex h-screen bg-walmart-gray"
          >
            {/* Left Panel - Chat & Agent */}
            <div className="w-1/3 min-w-[400px] flex flex-col border-r border-gray-200 bg-white shadow-lg">
              {/* Header with Back Button - Walmart Style */}
              <div className="bg-walmart-blue p-4 border-b border-walmart-blue-dark">
                <div className="flex items-center justify-between">
                  <button
                    onClick={props.onBackToEcommerce}
                    className="flex items-center text-white hover:text-walmart-yellow transition-colors font-medium"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Shop
                  </button>
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-walmart-yellow rounded-full mr-2 flex items-center justify-center">
                      <span className="text-walmart-blue font-bold text-sm">AI</span>
                    </div>
                    <h2 className="text-white font-semibold">Shopping Assistant</h2>
                  </div>
                </div>
              </div>
              
              {/* Assistant Status Bar */}
              <div className="bg-walmart-yellow/10 border-b border-walmart-yellow/20 px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                    <span className="text-walmart-blue text-sm font-medium">Sarah is ready to help</span>
                  </div>
                  <div className="text-xs text-walmart-dark-gray">
                    Voice Shopping Active
                  </div>
                </div>
              </div>

              <div className="flex-1 flex flex-col items-center gap-4 p-6 bg-walmart-gray">
                <AgentVisualizer />
                <div className="flex-1 w-full">
                  <TranscriptionView />
                </div>
                <div className="w-full">
                  <ControlBar 
                    onConnectButtonClicked={props.onConnectButtonClicked}
                    onDisconnect={props.onDisconnect}
                  />
                </div>
              </div>
            </div>
            
            {/* Right Panel - Product Visualization */}
            <div className="flex-1 bg-white">
              <div className="h-full flex flex-col">
                {                /* Right Panel Header */}
                <div className="bg-white border-b border-gray-200 p-4">
                  <h3 className="text-lg font-semibold text-walmart-dark-gray">Product Recommendations</h3>
                  <p className="text-sm text-gray-600 mt-1">Sarah will show you products based on your conversation</p>
                </div>
                <div className="flex-1">
                  <ProductVisualizationPanel />
                </div>
              </div>
            </div>
            
            {/* Overlay Components */}
            <ProductCardContainer />
            <ProductQuizContainer />
            <RoomAudioRenderer />
            <NoAgentNotification state={agentState} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function AgentVisualizer() {
  const { state: agentState, videoTrack, audioTrack } = useVoiceAssistant();

  if (videoTrack) {
    return (
      <div className="h-[512px] w-[512px] rounded-lg overflow-hidden">
        <VideoTrack trackRef={videoTrack} />
      </div>
    );
  }
  return (
    <div className="h-[280px] w-full bg-white rounded-lg border border-gray-200 shadow-sm">
      <BarVisualizer
        state={agentState}
        barCount={5}
        trackRef={audioTrack}
        className="agent-visualizer h-full w-full"
        options={{ minHeight: 24 }}
      />
    </div>
  );
}

function ControlBar(props: { onConnectButtonClicked: () => void; onDisconnect: () => void }) {
  const { state: agentState } = useVoiceAssistant();

  return (
    <div className="relative h-[60px] bg-white rounded-lg border border-gray-200 shadow-sm">
      <AnimatePresence>
        {agentState === "disconnected" && (
          <motion.button
            initial={{ opacity: 0, top: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, top: "-10px" }}
            transition={{ duration: 1, ease: [0.09, 1.04, 0.245, 1.055] }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-6 py-3 bg-walmart-blue hover:bg-walmart-blue-dark text-white rounded-full font-medium transition-all duration-300 shadow-lg flex items-center"
            onClick={() => props.onConnectButtonClicked()}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            Start Voice Shopping
          </motion.button>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {agentState !== "disconnected" && agentState !== "connecting" && (
          <motion.div
            initial={{ opacity: 0, top: "10px" }}
            animate={{ opacity: 1, top: 0 }}
            exit={{ opacity: 0, top: "-10px" }}
            transition={{ duration: 0.4, ease: [0.09, 1.04, 0.245, 1.055] }}
            className="flex h-full items-center justify-center space-x-3"
          >
            <VoiceAssistantControlBar controls={{ leave: false }} />
            <button
              onClick={props.onDisconnect}
              className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors shadow-sm"
            >
              <CloseIcon />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function onDeviceFailure(error: Error) {
  console.error(error);
  alert(
    "Error acquiring camera or microphone permissions. Please make sure you grant the necessary permissions in your browser and reload the tab"
  );
}
