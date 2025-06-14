// ProductViewer.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Product } from '../app/types/Product';
import { ZoomIn, ZoomOut } from 'lucide-react';
import QRCode from 'qrcode.react';

// Model viewer element type
interface ModelViewerElement extends HTMLElement {
  cameraTarget: string;
  cameraOrbit: string;
  autoRotate: boolean;
  resetTurntableRotation(): void;
  zoom(delta: number): void;
  requestFullscreen(): Promise<void>;
  canActivateAR?: boolean; // Added for AR support detection
}

// JSX intrinsic elements declaration
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        src?: string;
        'ios-src'?: string;
        alt?: string;
        ar?: boolean;
        'ar-modes'?: string;
        'camera-controls'?: boolean;
        'auto-rotate'?: boolean;
        'shadow-intensity'?: string;
        loading?: string;
        ref?: React.RefObject<ModelViewerElement>;
        'camera-orbit'?: string;
        'min-camera-orbit'?: string;
        'max-camera-orbit'?: string;
        'environment-image'?: string;
      };
    }
  }
}

interface ProductViewerProps {
  product: Product;
}

export const ProductViewer: React.FC<ProductViewerProps> = ({ product }) => {
  const modelViewerRef = useRef<ModelViewerElement>(null);
  const [modelViewerReady, setModelViewerReady] = useState(false);
  const [modelError, setModelError] = useState(false);
  const [ARSupported, setARSupported] = useState(false);

  // Effect to check if <model-viewer> custom element is defined
  useEffect(() => {
    const check = () => {
      if (customElements.get('model-viewer')) {
        setModelViewerReady(true);
      } else {
        // Retry check if model-viewer is not yet defined
        setTimeout(check, 500);
      }
    };
    
    if (product && product.assets && product.assets.model3D) {
        check();
    }
  }, [product]);

  // Effect to log load/error events from model-viewer
  useEffect(() => {
    const mv = modelViewerRef.current;
    if (mv && modelViewerReady && product && product.assets && product.assets.model3D) {
      const onLoad = () => { 
        setModelError(false); 
      };
      
      const onError = () => { // Removed unused event parameter
        console.error('Error loading 3D model.'); // User-friendly error
        setModelError(true);
      };

      // Removed progress event listener as it was only logging to console
      // const onProgress = (_event: Event) => { // Marked event as unused
      //   // const progressEvent = event as CustomEvent;
      //   // console.log('MINIMAL: Model loading progress:', progressEvent.detail?.totalProgress);
      // };

      mv.addEventListener('load', onLoad);
      mv.addEventListener('error', onError);
      // mv.addEventListener('progress', onProgress); // Progress listener removed

      // Check for AR support
      const checkARSupport = () => { // Removed async as canActivateAR is a property
        if (modelViewerRef.current?.canActivateAR !== undefined) {
          setARSupported(!!modelViewerRef.current.canActivateAR);
        }
      };
      checkARSupport();

      return () => {
        mv.removeEventListener('load', onLoad);
        mv.removeEventListener('error', onError);
        // mv.removeEventListener('progress', onProgress); // Progress listener removal removed
      };
    }
  }, [modelViewerReady, product]);

  if (!product || !product.assets?.model3D) {
    return (
      <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '8px', backgroundColor: '#fdfdfd', margin: '20px', textAlign: 'center' }}>
        <p style={{ fontWeight: 'bold', color: '#c9302c' }}>Product Data Incomplete</p>
        <p>The 3D model information for this product is currently unavailable.</p>
      </div>
    );
  }

  if (!modelViewerReady) {
    return (
      <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '8px', backgroundColor: '#f0f8ff', margin: '20px', textAlign: 'center' }}>
        <p style={{ fontWeight: 'bold', color: '#2e6da4' }}>Initializing 3D Viewer...</p>
        <p>Please wait a moment.</p>
      </div>
    );
  }

  const handleZoom = (factor: number) => {
    modelViewerRef.current?.zoom(factor);
  };

  return (
    <div className="relative w-full h-full min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Enhanced Header */}
      {/* <div className="absolute top-0 left-0 right-0 z-20 bg-white/80 backdrop-blur-sm border-b border-gray-200/50">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-walmart-blue">{product.name}</h1>
              <p className="text-walmart-dark-gray font-medium">{product.brand}</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600 mb-1">AR Experience</div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-600">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div> */}

      {/* Enhanced Control Panel */}
      <div className="absolute top-24 right-6 z-20 bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-gray-200/50">
        <div className="flex flex-col gap-3">
          <div className="text-center mb-2">
            <p className="text-xs font-semibold text-walmart-dark-gray uppercase tracking-wide">Controls</p>
          </div>
          
          <button 
            onClick={() => handleZoom(0.2)} 
            className="w-12 h-12 bg-walmart-blue hover:bg-walmart-blue-dark text-white rounded-xl transition-all duration-300 flex items-center justify-center group hover:scale-110 shadow-lg"
            title="Zoom In"
          >
            <ZoomIn size={20} className="group-hover:scale-110 transition-transform" />
          </button>
          
          <button 
            onClick={() => handleZoom(-0.2)} 
            className="w-12 h-12 bg-walmart-blue hover:bg-walmart-blue-dark text-white rounded-xl transition-all duration-300 flex items-center justify-center group hover:scale-110 shadow-lg"
            title="Zoom Out"
          >
            <ZoomOut size={20} className="group-hover:scale-110 transition-transform" />
          </button>
          
          <button 
            onClick={() => modelViewerRef.current?.resetTurntableRotation()}
            className="w-12 h-12 bg-walmart-yellow hover:bg-walmart-yellow-dark text-walmart-blue rounded-xl transition-all duration-300 flex items-center justify-center group hover:scale-110 shadow-lg"
            title="Reset View"
          >
            <div className="w-5 h-5 border-2 border-current rounded-full group-hover:scale-110 transition-transform"></div>
          </button>
        </div>
      </div>

      {/* Error Display */}
      {modelError && (
        <div className="absolute inset-0 z-30 flex items-center justify-center p-6">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md text-center shadow-xl">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="text-red-500 text-2xl">⚠</div>
            </div>
            <h3 className="text-lg font-bold text-red-800 mb-3">Failed to load 3D model</h3>
            <p className="text-red-600 text-sm mb-4">The 3D model could not be loaded. Please try again or contact support.</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Reload Page
            </button>
          </div>
        </div>
      )}

      {ARSupported && typeof window !== 'undefined' && (
        <div className="absolute bottom-6 right-6 z-20 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-xl border border-gray-200/50">
          <div className="text-center">
            <div className="w-12 h-12 bg-walmart-blue rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-white font-bold text-sm">AR</span>
            </div>
            <p className="font-semibold text-walmart-blue text-sm mb-1">View in AR</p>
            <p className="text-xs text-gray-600">Tap to activate</p>
          </div>
        </div>
      )}

      <model-viewer
        ref={modelViewerRef}
        src={product.assets.model3D}
        alt={`3D model of ${product.name}`}
        style={{ width: '100%', height: '500px', backgroundColor: '#f9f9f9', border: '1px solid #eee', borderRadius: '4px' }}
        camera-controls
        auto-rotate
        ar // Enable AR
        ar-modes="webxr scene-viewer quick-look" // Specify AR modes
        environment-image="neutral" // Using neutral, can be changed to a custom HDR if available
        shadow-intensity="1"
        loading="eager" // Eager loading as component handles its own loading state
        // ios-src="" // Add if USDZ model is available
      >
        <div slot="poster" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', backgroundColor: '#f0f0f0', color: '#555'}}>
            <p style={{fontSize: '1em', fontWeight: '500'}}>Loading 3D Model</p>
            <p style={{fontSize: '0.8em'}}>({product.name})</p>
            {/* Basic spinner */}
            <div style={{
              marginTop: '10px',
              border: '4px solid #f3f3f3', /* Light grey */
              borderTop: '4px solid #3498db', /* Blue */
              borderRadius: '50%',
              width: '30px',
              height: '30px',
              animation: 'spin 1s linear infinite'
            }}></div>
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
        </div>
      </model-viewer>
              {!ARSupported && (
          <div className="bottom-6 left-6 bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg flex items-center gap-4 z-50">
            <QRCode
              value={window.location.href}
              size={80}
              bgColor="#ffffff"
              fgColor="#0071ce"
              level="H"
              includeMargin
            />
            <div>
              <p className="font-medium text-gray-800 mb-1">Scan for AR View</p>
              <p className="text-sm text-gray-600">Use your mobile device to view in AR</p>
            </div>
          </div>
        )}
    </div>
  );
};