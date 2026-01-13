import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Environment as DreiEnvironment, ContactShadows, Grid } from '@react-three/drei';

export default function Environment() {
  const directionalRef = useRef();

  useFrame((state) => {
    // Subtle light animation
    if (directionalRef.current) {
      directionalRef.current.position.x = Math.sin(state.clock.elapsedTime * 0.1) * 2 + 5;
    }
  });

  return (
    <>
      {/* Ambient light */}
      <ambientLight intensity={0.4} />

      {/* Main directional light */}
      <directionalLight
        ref={directionalRef}
        position={[5, 8, 5]}
        intensity={1}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />

      {/* Fill light */}
      <directionalLight position={[-5, 3, -5]} intensity={0.3} />

      {/* Rim light */}
      <directionalLight position={[0, 5, -8]} intensity={0.5} color="#a5b4fc" />

      {/* Ground plane with shadows */}
      <ContactShadows
        position={[0, -0.4, 0]}
        opacity={0.4}
        scale={15}
        blur={2.5}
        far={4}
      />

      {/* Grid floor */}
      <Grid
        position={[0, -0.39, 0]}
        args={[20, 20]}
        cellSize={0.5}
        cellThickness={0.5}
        cellColor="#ddd"
        sectionSize={2}
        sectionThickness={1}
        sectionColor="#bbb"
        fadeDistance={15}
        fadeStrength={1}
        followCamera={false}
        infiniteGrid
      />

      {/* Environment lighting */}
      <DreiEnvironment preset="studio" />

      {/* Fog for depth */}
      <fog attach="fog" args={['#F2F2F2', 10, 30]} />
    </>
  );
}
