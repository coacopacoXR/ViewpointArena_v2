import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Loader } from '@react-three/drei';
import Synthesizer from './Synthesizer';
import AIAgents from './AIAgent';
import UserLaser from './UserLaser';
import Heatmap from './Heatmap';
import ViewportController from './ViewportController';
import Environment from './Environment';

function SceneContent() {
  return (
    <>
      <ViewportController />
      <Environment />

      <Suspense fallback={null}>
        <Synthesizer />
        <AIAgents />
        <UserLaser />
        <Heatmap />
      </Suspense>
    </>
  );
}

export default function Scene() {
  return (
    <div className="w-full h-full canvas-container">
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{
          antialias: true,
          toneMapping: 3, // ACESFilmicToneMapping
          toneMappingExposure: 1,
        }}
        camera={{ position: [4, 3, 4], fov: 50 }}
      >
        <color attach="background" args={['#F2F2F2']} />
        <SceneContent />
      </Canvas>
      <Loader />
    </div>
  );
}
