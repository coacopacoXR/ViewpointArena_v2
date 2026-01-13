import { useRef, useMemo } from 'react';
import { RoundedBox, Cylinder, Text } from '@react-three/drei';
import useArenaStore from '../../store/useArenaStore';

// Knob Component
function Knob({ position, id, color = '#333', size = 0.15, label }) {
  const meshRef = useRef();
  const { selectedComponentId, hoveredComponentId, setHoveredComponent } = useArenaStore();

  const isSelected = selectedComponentId === id;
  const isHovered = hoveredComponentId === id;

  const emissiveIntensity = isSelected ? 0.5 : isHovered ? 0.3 : 0;

  return (
    <group position={position}>
      {/* Knob base */}
      <Cylinder
        ref={meshRef}
        args={[size, size * 1.1, 0.08, 32]}
        rotation={[Math.PI / 2, 0, 0]}
        userData={{ componentId: id }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHoveredComponent(id);
        }}
        onPointerOut={() => setHoveredComponent(null)}
      >
        <meshStandardMaterial
          color={color}
          metalness={0.8}
          roughness={0.2}
          emissive={isSelected ? '#4F46E5' : '#fff'}
          emissiveIntensity={emissiveIntensity}
        />
      </Cylinder>
      {/* Knob indicator */}
      <Cylinder
        args={[0.02, 0.02, size * 0.5]}
        position={[0, 0.05, size * 0.6]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={0.3} />
      </Cylinder>
      {/* Label */}
      {label && (
        <Text
          position={[0, -0.25, 0]}
          fontSize={0.06}
          color="#666"
          anchorX="center"
          anchorY="top"
        >
          {label}
        </Text>
      )}
    </group>
  );
}

// Display Screen Component
function DisplayScreen({ position, id }) {
  const { selectedComponentId, hoveredComponentId, setHoveredComponent } = useArenaStore();
  const isSelected = selectedComponentId === id;
  const isHovered = hoveredComponentId === id;

  return (
    <group position={position}>
      {/* Screen frame */}
      <RoundedBox
        args={[1.5, 0.6, 0.08]}
        radius={0.02}
        userData={{ componentId: id }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHoveredComponent(id);
        }}
        onPointerOut={() => setHoveredComponent(null)}
      >
        <meshStandardMaterial
          color="#1a1a1a"
          metalness={0.3}
          roughness={0.5}
          emissive={isSelected ? '#4F46E5' : isHovered ? '#333' : '#000'}
          emissiveIntensity={isSelected ? 0.3 : isHovered ? 0.2 : 0}
        />
      </RoundedBox>
      {/* Screen glass */}
      <RoundedBox args={[1.4, 0.5, 0.02]} position={[0, 0, 0.04]} radius={0.01}>
        <meshStandardMaterial
          color="#0a1628"
          metalness={0.1}
          roughness={0.1}
          emissive="#1e40af"
          emissiveIntensity={0.15}
        />
      </RoundedBox>
      {/* Screen content simulation */}
      <Text
        position={[0, 0.1, 0.06]}
        fontSize={0.08}
        color="#3b82f6"
      >
        VIEWPOINT ARENA
      </Text>
      <Text
        position={[0, -0.08, 0.06]}
        fontSize={0.05}
        color="#60a5fa"
      >
        Design Review Mode
      </Text>
    </group>
  );
}

// LED Strip Component
function LEDStrip({ position, id }) {
  const { setHoveredComponent } = useArenaStore();

  const ledCount = 12;
  const leds = useMemo(() => {
    return Array.from({ length: ledCount }, (_, i) => ({
      position: [(i - ledCount / 2 + 0.5) * 0.15, 0, 0],
      color: i < 4 ? '#22c55e' : i < 8 ? '#eab308' : '#ef4444',
      intensity: 0.5 + (i % 3) * 0.2,
    }));
  }, []);

  return (
    <group
      position={position}
      userData={{ componentId: id }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHoveredComponent(id);
      }}
      onPointerOut={() => setHoveredComponent(null)}
    >
      {leds.map((led, i) => (
        <Cylinder key={i} args={[0.03, 0.03, 0.02, 16]} position={led.position}>
          <meshStandardMaterial
            color={led.color}
            emissive={led.color}
            emissiveIntensity={led.intensity}
          />
        </Cylinder>
      ))}
    </group>
  );
}

// Port Component
function Port({ position, id, type = 'audio' }) {
  const { selectedComponentId, setHoveredComponent } = useArenaStore();
  const isSelected = selectedComponentId === id;

  const portColor = type === 'audio' ? '#1a1a1a' : type === 'midi' ? '#333' : '#444';

  return (
    <group position={position}>
      <Cylinder
        args={[0.08, 0.08, 0.1, 16]}
        rotation={[Math.PI / 2, 0, 0]}
        userData={{ componentId: id }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHoveredComponent(id);
        }}
        onPointerOut={() => setHoveredComponent(null)}
      >
        <meshStandardMaterial
          color={portColor}
          metalness={0.9}
          roughness={0.2}
          emissive={isSelected ? '#4F46E5' : '#000'}
          emissiveIntensity={isSelected ? 0.5 : 0}
        />
      </Cylinder>
      {/* Inner hole */}
      <Cylinder args={[0.04, 0.04, 0.12, 16]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="#000" />
      </Cylinder>
    </group>
  );
}

// Main Synthesizer Component
export default function Synthesizer() {
  const groupRef = useRef();
  const { selectedComponentId, setHoveredComponent } = useArenaStore();

  // Find visible state from scene tree
  const sceneTree = useArenaStore((state) => state.sceneTree);

  const findVisibility = (nodeId, tree) => {
    if (tree.id === nodeId) return tree.visible;
    if (tree.children) {
      for (const child of tree.children) {
        const result = findVisibility(nodeId, child);
        if (result !== undefined) return result;
      }
    }
    return true;
  };

  const isVisible = (id) => findVisibility(id, sceneTree);

  return (
    <group ref={groupRef}>
      {/* Main Chassis Body */}
      {isVisible('main-body') && (
        <RoundedBox
          args={[5, 0.8, 2]}
          radius={0.05}
          position={[0, 0, 0]}
          userData={{ componentId: 'main-body' }}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHoveredComponent('main-body');
          }}
          onPointerOut={() => setHoveredComponent(null)}
        >
          <meshStandardMaterial
            color="#2a2a2a"
            metalness={0.4}
            roughness={0.6}
            emissive={selectedComponentId === 'main-body' ? '#4F46E5' : '#000'}
            emissiveIntensity={selectedComponentId === 'main-body' ? 0.2 : 0}
          />
        </RoundedBox>
      )}

      {/* Side Panel Left */}
      {isVisible('side-panel-left') && (
        <RoundedBox
          args={[0.3, 0.9, 2.1]}
          radius={0.03}
          position={[-2.65, 0, 0]}
          userData={{ componentId: 'side-panel-left' }}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHoveredComponent('side-panel-left');
          }}
          onPointerOut={() => setHoveredComponent(null)}
        >
          <meshStandardMaterial
            color="#8B4513"
            metalness={0.1}
            roughness={0.8}
            emissive={selectedComponentId === 'side-panel-left' ? '#4F46E5' : '#000'}
            emissiveIntensity={selectedComponentId === 'side-panel-left' ? 0.2 : 0}
          />
        </RoundedBox>
      )}

      {/* Side Panel Right */}
      {isVisible('side-panel-right') && (
        <RoundedBox
          args={[0.3, 0.9, 2.1]}
          radius={0.03}
          position={[2.65, 0, 0]}
          userData={{ componentId: 'side-panel-right' }}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHoveredComponent('side-panel-right');
          }}
          onPointerOut={() => setHoveredComponent(null)}
        >
          <meshStandardMaterial
            color="#8B4513"
            metalness={0.1}
            roughness={0.8}
            emissive={selectedComponentId === 'side-panel-right' ? '#4F46E5' : '#000'}
            emissiveIntensity={selectedComponentId === 'side-panel-right' ? 0.2 : 0}
          />
        </RoundedBox>
      )}

      {/* Control Surface Panel */}
      <RoundedBox
        args={[4.8, 0.1, 1.8]}
        radius={0.02}
        position={[0, 0.45, 0]}
      >
        <meshStandardMaterial color="#1a1a1a" metalness={0.5} roughness={0.4} />
      </RoundedBox>

      {/* Oscillator Section */}
      {isVisible('osc-1-knob') && (
        <Knob position={[-1.5, 0.55, 0.5]} id="osc-1-knob" color="#4F46E5" label="OSC 1" />
      )}
      {isVisible('osc-2-knob') && (
        <Knob position={[-0.8, 0.55, 0.5]} id="osc-2-knob" color="#6366f1" label="OSC 2" />
      )}
      {isVisible('osc-mix-knob') && (
        <Knob position={[-1.15, 0.55, 0.1]} id="osc-mix-knob" color="#818cf8" size={0.12} label="MIX" />
      )}

      {/* Filter Section */}
      {isVisible('filter-cutoff') && (
        <Knob position={[0.2, 0.55, 0.5]} id="filter-cutoff" color="#10B981" label="CUTOFF" />
      )}
      {isVisible('filter-resonance') && (
        <Knob position={[0.9, 0.55, 0.5]} id="filter-resonance" color="#34d399" label="RES" />
      )}
      {isVisible('filter-env') && (
        <Knob position={[0.55, 0.55, 0.1]} id="filter-env" color="#6ee7b7" size={0.12} label="ENV" />
      )}

      {/* Master Section */}
      {isVisible('master-volume') && (
        <Knob position={[1.8, 0.55, 0.5]} id="master-volume" color="#ef4444" size={0.2} label="VOLUME" />
      )}
      {isVisible('master-tune') && (
        <Knob position={[1.8, 0.55, 0]} id="master-tune" color="#f87171" size={0.12} label="TUNE" />
      )}

      {/* Display Module */}
      {isVisible('main-screen') && (
        <DisplayScreen position={[0, 0.7, -0.5]} id="main-screen" />
      )}
      {isVisible('led-strip') && (
        <LEDStrip position={[0, 0.52, -0.7]} id="led-strip" />
      )}

      {/* I/O Panel (Back) */}
      {isVisible('audio-out') && (
        <>
          <Port position={[0, 0, -1.05]} id="audio-out" type="audio" />
          <Port position={[0.25, 0, -1.05]} id="audio-out" type="audio" />
        </>
      )}
      {isVisible('midi-ports') && (
        <>
          <Port position={[-1, 0, -1.05]} id="midi-ports" type="midi" />
          <Port position={[-0.7, 0, -1.05]} id="midi-ports" type="midi" />
        </>
      )}
      {isVisible('usb-port') && (
        <RoundedBox
          args={[0.15, 0.06, 0.08]}
          position={[1, 0, -1.02]}
          radius={0.01}
          userData={{ componentId: 'usb-port' }}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHoveredComponent('usb-port');
          }}
          onPointerOut={() => setHoveredComponent(null)}
        >
          <meshStandardMaterial
            color="#333"
            metalness={0.8}
            roughness={0.3}
            emissive={selectedComponentId === 'usb-port' ? '#4F46E5' : '#000'}
            emissiveIntensity={selectedComponentId === 'usb-port' ? 0.5 : 0}
          />
        </RoundedBox>
      )}

      {/* Section Labels */}
      <Text
        position={[-1.15, 0.52, 0.85]}
        fontSize={0.08}
        color="#666"
        anchorX="center"
      >
        OSCILLATORS
      </Text>
      <Text
        position={[0.55, 0.52, 0.85]}
        fontSize={0.08}
        color="#666"
        anchorX="center"
      >
        FILTER
      </Text>
      <Text
        position={[1.8, 0.52, 0.85]}
        fontSize={0.08}
        color="#666"
        anchorX="center"
      >
        MASTER
      </Text>
    </group>
  );
}
