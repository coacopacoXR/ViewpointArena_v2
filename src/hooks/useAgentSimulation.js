import { useEffect, useRef } from 'react';
import useArenaStore from '../store/useArenaStore';

// POI groups for logical navigation
const poiGroups = {
  oscillators: ['osc-1-knob', 'osc-2-knob', 'osc-mix-knob'],
  filter: ['filter-cutoff', 'filter-resonance', 'filter-env'],
  master: ['master-volume', 'master-tune'],
  display: ['main-screen', 'led-strip'],
  io: ['audio-out', 'midi-ports', 'usb-port'],
  chassis: ['main-body', 'side-panel-left', 'side-panel-right'],
};

// All POIs flat
const allPois = Object.values(poiGroups).flat();

export default function useAgentSimulation() {
  const {
    agents,
    isSimulationRunning,
    simulationSpeed,
    setAgentTarget,
  } = useArenaStore();

  const agentTimers = useRef({});

  useEffect(() => {
    if (!isSimulationRunning) {
      // Clear all timers when simulation stops
      Object.values(agentTimers.current).forEach((timer) => clearTimeout(timer));
      agentTimers.current = {};
      return;
    }

    // Initialize agent behavior cycles
    agents.forEach((agent) => {
      if (agent.followingId) return; // Don't control following agents

      const scheduleNextMove = () => {
        // Random inspection time between 5-15 seconds
        const inspectionTime = (5000 + Math.random() * 10000) / simulationSpeed;

        agentTimers.current[agent.id] = setTimeout(() => {
          // Pick next POI
          // 70% chance to stay in same group, 30% to move to different group
          const currentGroup = Object.entries(poiGroups).find(([, groupPois]) =>
            groupPois.includes(agent.targetPoiId)
          );

          let nextPoi;
          if (currentGroup && Math.random() > 0.3) {
            // Stay in group
            const groupPois = currentGroup[1].filter((p) => p !== agent.targetPoiId);
            nextPoi = groupPois[Math.floor(Math.random() * groupPois.length)] || allPois[Math.floor(Math.random() * allPois.length)];
          } else {
            // Move to different group
            const otherPois = allPois.filter((p) => p !== agent.targetPoiId);
            nextPoi = otherPois[Math.floor(Math.random() * otherPois.length)];
          }

          setAgentTarget(agent.id, nextPoi);

          // Schedule next move after this one
          scheduleNextMove();
        }, inspectionTime);
      };

      scheduleNextMove();
    });

    return () => {
      Object.values(agentTimers.current).forEach((timer) => clearTimeout(timer));
      agentTimers.current = {};
    };
  }, [isSimulationRunning, simulationSpeed, agents, setAgentTarget]);

  return null;
}
