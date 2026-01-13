import { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import useArenaStore from '../../store/useArenaStore';

export default function UserLaser() {
  const { camera, gl, scene } = useThree();
  const laserRef = useRef();
  const pointRef = useRef();
  const raycaster = useRef(new THREE.Raycaster());

  const {
    laserActive,
    setLaserActive,
    setLaserTarget,
    setSelectedComponent,
  } = useArenaStore();

  const [mouseButtons, setMouseButtons] = useState({ left: false, right: false });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hitPoint, setHitPoint] = useState(null);

  // Track mouse buttons
  useEffect(() => {
    const handleMouseDown = (e) => {
      if (e.button === 0) setMouseButtons((prev) => ({ ...prev, left: true }));
      if (e.button === 2) setMouseButtons((prev) => ({ ...prev, right: true }));
    };

    const handleMouseUp = (e) => {
      if (e.button === 0) setMouseButtons((prev) => ({ ...prev, left: false }));
      if (e.button === 2) setMouseButtons((prev) => ({ ...prev, right: false }));
    };

    const handleMouseMove = (e) => {
      const rect = gl.domElement.getBoundingClientRect();
      setMousePosition({
        x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
        y: -((e.clientY - rect.top) / rect.height) * 2 + 1,
      });
    };

    const handleContextMenu = (e) => {
      e.preventDefault();
    };

    gl.domElement.addEventListener('mousedown', handleMouseDown);
    gl.domElement.addEventListener('mouseup', handleMouseUp);
    gl.domElement.addEventListener('mousemove', handleMouseMove);
    gl.domElement.addEventListener('contextmenu', handleContextMenu);

    return () => {
      gl.domElement.removeEventListener('mousedown', handleMouseDown);
      gl.domElement.removeEventListener('mouseup', handleMouseUp);
      gl.domElement.removeEventListener('mousemove', handleMouseMove);
      gl.domElement.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [gl.domElement]);

  // Update laser active state
  useEffect(() => {
    const isActive = mouseButtons.left && mouseButtons.right;
    setLaserActive(isActive);

    if (isActive) {
      gl.domElement.classList.add('laser-active');
    } else {
      gl.domElement.classList.remove('laser-active');
    }
  }, [mouseButtons, setLaserActive, gl.domElement]);

  // Raycasting on each frame
  useFrame(() => {
    if (!laserActive) {
      setHitPoint(null);
      return;
    }

    raycaster.current.setFromCamera(mousePosition, camera);

    // Get all meshes with componentId
    const intersects = raycaster.current.intersectObjects(scene.children, true);

    let foundComponent = null;
    let closestHit = null;

    for (const intersect of intersects) {
      if (!closestHit) {
        closestHit = intersect;
      }

      // Check for component ID in userData
      let current = intersect.object;
      while (current) {
        if (current.userData?.componentId) {
          foundComponent = current.userData.componentId;
          break;
        }
        current = current.parent;
      }

      if (foundComponent) break;
    }

    if (closestHit) {
      setHitPoint(closestHit.point);
    } else {
      setHitPoint(null);
    }

    if (foundComponent) {
      setSelectedComponent(foundComponent);
      setLaserTarget({ componentId: foundComponent, point: closestHit?.point });
    }
  });

  if (!laserActive || !hitPoint) return null;

  // Calculate laser line from camera to hit point
  const cameraPos = camera.position.clone();
  const direction = hitPoint.clone().sub(cameraPos);
  const length = direction.length();

  return (
    <group>
      {/* Laser beam */}
      <mesh
        ref={laserRef}
        position={cameraPos.clone().add(direction.clone().multiplyScalar(0.5))}
        quaternion={new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          direction.clone().normalize()
        )}
      >
        <cylinderGeometry args={[0.003, 0.003, length, 8]} />
        <meshBasicMaterial color="#ef4444" transparent opacity={0.8} />
      </mesh>

      {/* Hit point indicator */}
      <group position={hitPoint}>
        {/* Outer ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.08, 0.1, 32]} />
          <meshBasicMaterial color="#ef4444" transparent opacity={0.8} side={THREE.DoubleSide} />
        </mesh>
        {/* Inner dot */}
        <mesh ref={pointRef}>
          <sphereGeometry args={[0.03, 16, 16]} />
          <meshBasicMaterial color="#fff" />
        </mesh>
        {/* Glow */}
        <pointLight color="#ef4444" intensity={2} distance={1} />
      </group>
    </group>
  );
}
