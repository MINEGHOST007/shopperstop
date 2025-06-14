import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';

interface ThreeDModelViewerProps {
  modelUrl: string;
}

const Model: React.FC<{ modelUrl: string }> = ({ modelUrl }) => {
  const { scene } = useGLTF(modelUrl);
  return <primitive object={scene} dispose={null} />;
};

export const ThreeDModelViewer: React.FC<ThreeDModelViewerProps> = ({ modelUrl }) => {
  return (
    <Canvas camera={{ position: [0, 0, 5] }} style={{ width: '100%', height: '100%' }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <Suspense fallback={null}>
        <Model modelUrl={modelUrl} />
      </Suspense>
      <OrbitControls />
    </Canvas>
  );
};