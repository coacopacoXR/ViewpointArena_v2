import { useMemo } from 'react';
import { Sphere } from '@react-three/drei';
import * as THREE from 'three';
import useArenaStore, { ViewMode } from '../../store/useArenaStore';

// Color interpolation from blue (cold) to red (hot)
function getHeatColor(value, maxValue) {
  const normalized = Math.min(value / (maxValue || 1), 1);

  // Blue -> Cyan -> Green -> Yellow -> Orange -> Red
  const colors = [
    new THREE.Color('#3b82f6'), // Blue
    new THREE.Color('#06b6d4'), // Cyan
    new THREE.Color('#22c55e'), // Green
    new THREE.Color('#eab308'), // Yellow
    new THREE.Color('#f97316'), // Orange
    new THREE.Color('#ef4444'), // Red
  ];

  const segmentCount = colors.length - 1;
  const segment = normalized * segmentCount;
  const index = Math.min(Math.floor(segment), segmentCount - 1);
  const t = segment - index;

  return colors[index].clone().lerp(colors[index + 1], t);
}

// Individual heatmap sphere
function HeatSphere({ position, dwellTime, maxDwellTime }) {
  const color = useMemo(
    () => getHeatColor(dwellTime, maxDwellTime),
    [dwellTime, maxDwellTime]
  );

  // Scale based on dwell time
  const baseScale = 0.3;
  const maxScale = 0.8;
  const scale = baseScale + (dwellTime / (maxDwellTime || 1)) * (maxScale - baseScale);

  // Opacity based on dwell time
  const baseOpacity = 0.2;
  const maxOpacity = 0.6;
  const opacity = baseOpacity + (dwellTime / (maxDwellTime || 1)) * (maxOpacity - baseOpacity);

  return (
    <group position={position}>
      {/* Outer glow sphere */}
      <Sphere args={[scale * 1.5, 32, 32]}>
        <meshBasicMaterial
          color={color}
          transparent
          opacity={opacity * 0.3}
          depthWrite={false}
        />
      </Sphere>

      {/* Main heat sphere */}
      <Sphere args={[scale, 32, 32]}>
        <meshStandardMaterial
          color={color}
          transparent
          opacity={opacity}
          emissive={color}
          emissiveIntensity={0.5}
          depthWrite={false}
        />
      </Sphere>

      {/* Inner core */}
      <Sphere args={[scale * 0.3, 16, 16]}>
        <meshBasicMaterial
          color={color}
          transparent
          opacity={opacity + 0.2}
        />
      </Sphere>

      {/* Point light for glow effect */}
      <pointLight
        color={color}
        intensity={dwellTime / (maxDwellTime || 1) * 2}
        distance={2}
      />
    </group>
  );
}

export default function Heatmap() {
  const { viewMode, pois, getAggregateDwellTimes } = useArenaStore();

  const aggregateDwellTimes = useMemo(() => getAggregateDwellTimes(), [getAggregateDwellTimes]);

  const maxDwellTime = useMemo(() => {
    const times = Object.values(aggregateDwellTimes);
    return times.length > 0 ? Math.max(...times) : 1;
  }, [aggregateDwellTimes]);

  // Only show in heatmap mode
  if (viewMode !== ViewMode.HEATMAP) return null;

  return (
    <group>
      {Object.entries(pois).map(([poiId, poi]) => {
        const dwellTime = aggregateDwellTimes[poiId] || 0;

        // Only show spheres where there's been activity
        if (dwellTime < 0.1) return null;

        return (
          <HeatSphere
            key={poiId}
            position={poi.position}
            dwellTime={dwellTime}
            maxDwellTime={maxDwellTime}
          />
        );
      })}
    </group>
  );
}
