import { useRef, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import useArenaStore, { ViewMode } from '../../store/useArenaStore';

// Split Screen Renderer
function SplitScreenRenderer() {
  const { gl, scene, size } = useThree();
  const { agents, selectedAgentForSplit } = useArenaStore();

  const userCameraRef = useRef();
  const agentCameraRef = useRef();
  const controlsRef = useRef();

  const selectedAgent = useMemo(
    () => agents.find((a) => a.id === selectedAgentForSplit),
    [agents, selectedAgentForSplit]
  );

  useFrame(() => {
    if (!userCameraRef.current || !agentCameraRef.current || !selectedAgent) return;

    const halfWidth = Math.floor(size.width / 2);

    // Update agent camera to follow selected agent
    const agentPos = new THREE.Vector3(...selectedAgent.position);
    const agentLookAt = new THREE.Vector3(...selectedAgent.lookAt);

    agentCameraRef.current.position.copy(agentPos);
    agentCameraRef.current.lookAt(agentLookAt);

    // Clear and set up for split rendering
    gl.setScissorTest(true);

    // Left viewport - User camera
    gl.setViewport(0, 0, halfWidth, size.height);
    gl.setScissor(0, 0, halfWidth, size.height);
    gl.render(scene, userCameraRef.current);

    // Right viewport - Agent camera
    gl.setViewport(halfWidth, 0, halfWidth, size.height);
    gl.setScissor(halfWidth, 0, halfWidth, size.height);
    gl.render(scene, agentCameraRef.current);

    // Reset
    gl.setScissorTest(false);
  }, 1);

  return (
    <>
      <PerspectiveCamera
        ref={userCameraRef}
        makeDefault
        position={[5, 4, 5]}
        fov={50}
      />
      <PerspectiveCamera
        ref={agentCameraRef}
        position={selectedAgent?.position || [0, 2, 5]}
        fov={60}
      />
      <OrbitControls
        ref={controlsRef}
        target={[0, 0.5, 0]}
        enableDamping
        dampingFactor={0.05}
      />
    </>
  );
}

// AI Guided Focus Camera
function AIGuidedCamera() {
  const cameraRef = useRef();
  const controlsRef = useRef();
  const { agents, setUserCamera } = useArenaStore();

  useFrame((state, delta) => {
    if (!cameraRef.current || !controlsRef.current) return;

    // Calculate weighted camera target - average of agent positions
    const agentPositions = agents.map((a) => new THREE.Vector3(...a.position));
    const centerOfAgents = new THREE.Vector3();

    if (agentPositions.length > 0) {
      agentPositions.forEach((pos) => centerOfAgents.add(pos));
      centerOfAgents.divideScalar(agentPositions.length);
    }

    // Calculate average gaze direction
    const avgGazeTarget = new THREE.Vector3();
    agents.forEach((agent) => {
      avgGazeTarget.add(new THREE.Vector3(...agent.lookAt));
    });
    if (agents.length > 0) {
      avgGazeTarget.divideScalar(agents.length);
    }

    // Blend between center of agents and their average gaze target
    const focusPoint = centerOfAgents.clone().lerp(avgGazeTarget, 0.6);

    // Calculate ideal camera position - behind and above the "center of attention"
    const toTarget = focusPoint.clone().sub(centerOfAgents).normalize();
    const idealCameraPos = centerOfAgents.clone()
      .sub(toTarget.multiplyScalar(4))
      .add(new THREE.Vector3(0, 3, 0));

    // Smoothly move camera and target
    const currentTarget = controlsRef.current.target;
    currentTarget.lerp(focusPoint, delta * 2);

    cameraRef.current.position.lerp(idealCameraPos, delta * 1.5);

    // Update store with camera state
    setUserCamera(
      [cameraRef.current.position.x, cameraRef.current.position.y, cameraRef.current.position.z],
      [currentTarget.x, currentTarget.y, currentTarget.z]
    );

    controlsRef.current.update();
  });

  return (
    <>
      <PerspectiveCamera ref={cameraRef} makeDefault position={[5, 5, 5]} fov={50} />
      <OrbitControls
        ref={controlsRef}
        enableDamping
        dampingFactor={0.1}
        enableZoom={false}
        enablePan={false}
        enableRotate={false}
      />
    </>
  );
}

// Overhead View Camera
function OverheadCamera() {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 8, 0.1]} fov={60} />
      <OrbitControls
        target={[0, 0, 0]}
        enableDamping
        dampingFactor={0.05}
        maxPolarAngle={Math.PI / 4}
        minPolarAngle={0}
      />
    </>
  );
}

// Sync/Leader Mode Camera
function SyncLeaderCamera() {
  const cameraRef = useRef();
  const controlsRef = useRef();
  const { setUserCamera, setIsLeader } = useArenaStore();

  useEffect(() => {
    setIsLeader(true);
    return () => setIsLeader(false);
  }, [setIsLeader]);

  useFrame(() => {
    if (!cameraRef.current || !controlsRef.current) return;

    const pos = cameraRef.current.position;
    const target = controlsRef.current.target;

    setUserCamera(
      [pos.x, pos.y, pos.z],
      [target.x, target.y, target.z]
    );
  });

  return (
    <>
      <PerspectiveCamera ref={cameraRef} makeDefault position={[0, 3, 6]} fov={50} />
      <OrbitControls
        ref={controlsRef}
        target={[0, 0.5, 0]}
        enableDamping
        dampingFactor={0.05}
      />
    </>
  );
}

// Free Camera (default)
function FreeCamera() {
  const cameraRef = useRef();
  const controlsRef = useRef();
  const { setUserCamera } = useArenaStore();

  useFrame(() => {
    if (!cameraRef.current || !controlsRef.current) return;

    const pos = cameraRef.current.position;
    const target = controlsRef.current.target;

    setUserCamera(
      [pos.x, pos.y, pos.z],
      [target.x, target.y, target.z]
    );
  });

  return (
    <>
      <PerspectiveCamera ref={cameraRef} makeDefault position={[4, 3, 4]} fov={50} />
      <OrbitControls
        ref={controlsRef}
        target={[0, 0.5, 0]}
        enableDamping
        dampingFactor={0.05}
        minDistance={2}
        maxDistance={15}
      />
    </>
  );
}

// Main Viewport Controller
export default function ViewportController() {
  const { viewMode } = useArenaStore();

  switch (viewMode) {
    case ViewMode.SPLIT_SCREEN:
      return <SplitScreenRenderer />;
    case ViewMode.AI_GUIDED:
      return <AIGuidedCamera />;
    case ViewMode.OVERHEAD:
      return <OverheadCamera />;
    case ViewMode.SYNC_LEADER:
      return <SyncLeaderCamera />;
    case ViewMode.HEATMAP:
    case ViewMode.FREE:
    default:
      return <FreeCamera />;
  }
}
