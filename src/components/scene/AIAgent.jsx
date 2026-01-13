import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox, Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import useArenaStore, { AgentBehavior, ViewMode } from '../../store/useArenaStore';

// Individual Agent Component
function Agent({ agent, isVisible = true }) {
  const groupRef = useRef();
  const meshRef = useRef();
  const eyeLeftRef = useRef();
  const eyeRightRef = useRef();

  const {
    pois,
    updateAgentPosition,
    updateAgentLookAt,
    updateAgentBehavior,
    updateAgentDwellTime,
    viewMode,
    isLeader,
    userCameraPosition,
    userCameraTarget,
    simulationSpeed,
    agents,
  } = useArenaStore();

  // Target position for movement
  const targetPosition = useMemo(() => {
    if (agent.followingId) {
      const targetAgent = agents.find((a) => a.id === agent.followingId);
      if (targetAgent) {
        return new THREE.Vector3(...targetAgent.position).add(new THREE.Vector3(-0.5, 0, 0.5));
      }
    }
    const poi = pois[agent.targetPoiId];
    if (poi) {
      const poiPos = new THREE.Vector3(...poi.position);
      return poiPos.clone().add(new THREE.Vector3(0, 1.2, 1.5));
    }
    return new THREE.Vector3(...agent.position);
  }, [agent.targetPoiId, agent.followingId, pois, agents]);

  // Look at target
  const lookAtTarget = useMemo(() => {
    if (agent.followingId) {
      const targetAgent = agents.find((a) => a.id === agent.followingId);
      if (targetAgent) {
        return new THREE.Vector3(...targetAgent.lookAt);
      }
    }
    const poi = pois[agent.targetPoiId];
    if (poi) {
      return new THREE.Vector3(...poi.position);
    }
    return new THREE.Vector3(...agent.lookAt);
  }, [agent.targetPoiId, agent.followingId, pois, agents]);

  // Animation and movement
  useFrame((state, delta) => {
    if (!groupRef.current || !isVisible) return;

    const currentPos = new THREE.Vector3(...agent.position);
    let newTargetPos = targetPosition.clone();

    // Handle Sync/Leader mode - V formation behind camera
    if (viewMode === ViewMode.SYNC_LEADER && isLeader) {
      const cameraPos = new THREE.Vector3(...userCameraPosition);
      const cameraTarget = new THREE.Vector3(...userCameraTarget);
      const cameraDir = cameraTarget.clone().sub(cameraPos).normalize();

      // Calculate V formation position
      const agentIndex = agents.findIndex((a) => a.id === agent.id);
      const offsetX = (agentIndex % 2 === 0 ? -1 : 1) * (Math.floor(agentIndex / 2) + 1) * 1.5;
      const offsetZ = -2 - Math.floor(agentIndex / 2) * 1;

      const right = new THREE.Vector3().crossVectors(cameraDir, new THREE.Vector3(0, 1, 0)).normalize();
      newTargetPos = cameraPos.clone()
        .add(cameraDir.clone().multiplyScalar(offsetZ))
        .add(right.multiplyScalar(offsetX));
      newTargetPos.y = cameraPos.y;
    }

    // Smooth lerp movement
    const moveSpeed = 2 * simulationSpeed * delta;
    const distance = currentPos.distanceTo(newTargetPos);

    if (distance > 0.05) {
      currentPos.lerp(newTargetPos, moveSpeed);
      updateAgentPosition(agent.id, [currentPos.x, currentPos.y, currentPos.z]);

      if (agent.behavior !== AgentBehavior.MOVING && agent.behavior !== AgentBehavior.FOLLOWING) {
        updateAgentBehavior(agent.id, AgentBehavior.MOVING);
      }
    } else if (agent.behavior === AgentBehavior.MOVING) {
      updateAgentBehavior(agent.id, AgentBehavior.INSPECTING);
    }

    // Update look at with smooth rotation
    if (groupRef.current) {
      const currentLookAt = new THREE.Vector3(...agent.lookAt);
      let targetLook = lookAtTarget;

      // In sync mode, look where camera looks
      if (viewMode === ViewMode.SYNC_LEADER && isLeader) {
        targetLook = new THREE.Vector3(...userCameraTarget);
      }

      currentLookAt.lerp(targetLook, 3 * delta);
      updateAgentLookAt(agent.id, [currentLookAt.x, currentLookAt.y, currentLookAt.z]);

      // Make agent face target
      groupRef.current.lookAt(currentLookAt);
    }

    // Update dwell time when inspecting
    if (agent.behavior === AgentBehavior.INSPECTING) {
      updateAgentDwellTime(agent.id, agent.targetPoiId, delta * simulationSpeed);
    }

    // Floating animation
    if (meshRef.current) {
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 2 + agent.id.charCodeAt(6)) * 0.05;
    }

    // Eye animation (looking at target)
    if (eyeLeftRef.current && eyeRightRef.current) {
      const lookDir = lookAtTarget.clone().sub(currentPos).normalize();
      const eyeOffset = lookDir.multiplyScalar(0.02);
      eyeLeftRef.current.position.z = 0.16 + eyeOffset.z * 0.5;
      eyeRightRef.current.position.z = 0.16 + eyeOffset.z * 0.5;
    }
  });

  if (!isVisible) return null;

  // Name display with merged agents
  const displayName = agent.mergedWith.length > 0
    ? `${agent.name} + ${agent.mergedWith.join(', ')}`
    : agent.name;

  // Behavior indicator color
  const behaviorColor = {
    [AgentBehavior.IDLE]: '#666',
    [AgentBehavior.MOVING]: '#eab308',
    [AgentBehavior.INSPECTING]: '#22c55e',
    [AgentBehavior.FOLLOWING]: '#3b82f6',
  }[agent.behavior] || '#666';

  return (
    <group ref={groupRef} position={agent.position}>
      {/* Agent body - sleek floating cube/robot */}
      <group ref={meshRef}>
        {/* Main body */}
        <RoundedBox args={[0.4, 0.35, 0.3]} radius={0.05}>
          <meshStandardMaterial
            color={agent.color}
            metalness={0.6}
            roughness={0.3}
            emissive={agent.color}
            emissiveIntensity={0.2}
          />
        </RoundedBox>

        {/* Face plate */}
        <RoundedBox args={[0.35, 0.25, 0.05]} position={[0, 0, 0.15]} radius={0.02}>
          <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
        </RoundedBox>

        {/* Eyes */}
        <mesh ref={eyeLeftRef} position={[-0.08, 0.03, 0.16]}>
          <sphereGeometry args={[0.04, 16, 16]} />
          <meshStandardMaterial
            color="#fff"
            emissive="#fff"
            emissiveIntensity={0.5}
          />
        </mesh>
        <mesh ref={eyeRightRef} position={[0.08, 0.03, 0.16]}>
          <sphereGeometry args={[0.04, 16, 16]} />
          <meshStandardMaterial
            color="#fff"
            emissive="#fff"
            emissiveIntensity={0.5}
          />
        </mesh>

        {/* Antenna */}
        <mesh position={[0, 0.22, 0]}>
          <cylinderGeometry args={[0.01, 0.01, 0.1, 8]} />
          <meshStandardMaterial color="#666" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.28, 0]}>
          <sphereGeometry args={[0.025, 16, 16]} />
          <meshStandardMaterial
            color={behaviorColor}
            emissive={behaviorColor}
            emissiveIntensity={0.8}
          />
        </mesh>

        {/* Hover effect glow */}
        <pointLight color={agent.color} intensity={0.5} distance={2} />
      </group>

      {/* Name tag */}
      <Billboard position={[0, 0.5, 0]}>
        <Text
          fontSize={0.12}
          color={agent.color}
          anchorX="center"
          anchorY="bottom"
          outlineWidth={0.01}
          outlineColor="#000"
        >
          {displayName}
        </Text>
        <Text
          fontSize={0.06}
          color={behaviorColor}
          anchorX="center"
          anchorY="top"
          position={[0, -0.02, 0]}
        >
          {agent.behavior}
        </Text>
      </Billboard>
    </group>
  );
}

// All Agents Container
export default function AIAgents() {
  const { agents, viewMode } = useArenaStore();

  return (
    <group>
      {agents.map((agent) => {
        // Hide agent if following another (merged behavior)
        const isVisible = !agent.followingId || viewMode === ViewMode.HEATMAP;
        return <Agent key={agent.id} agent={agent} isVisible={isVisible} />;
      })}
    </group>
  );
}
