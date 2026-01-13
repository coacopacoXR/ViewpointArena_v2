import {
  Maximize2,
  Columns,
  Target,
  Users,
  Eye,
  Flame,
  Play,
  Pause,
  FastForward,
  RotateCcw,
} from 'lucide-react';
import useArenaStore, { ViewMode } from '../../store/useArenaStore';

const viewModes = [
  { id: ViewMode.FREE, label: 'Free', icon: Maximize2, description: 'Free orbital camera' },
  { id: ViewMode.SPLIT_SCREEN, label: 'Split', icon: Columns, description: 'User + Agent view' },
  { id: ViewMode.AI_GUIDED, label: 'AI Guided', icon: Target, description: 'Auto-focus on agents' },
  { id: ViewMode.SYNC_LEADER, label: 'Leader', icon: Users, description: 'Agents follow you' },
  { id: ViewMode.OVERHEAD, label: 'Overhead', icon: Eye, description: 'Top-down view' },
  { id: ViewMode.HEATMAP, label: 'Heatmap', icon: Flame, description: 'Show attention zones' },
];

const speedOptions = [
  { value: 0.5, label: '0.5x' },
  { value: 1, label: '1x' },
  { value: 2, label: '2x' },
  { value: 4, label: '4x' },
];

export default function ViewModeControls() {
  const {
    viewMode,
    setViewMode,
    agents,
    selectedAgentForSplit,
    setSelectedAgentForSplit,
    isSimulationRunning,
    setSimulationRunning,
    simulationSpeed,
    setSimulationSpeed,
  } = useArenaStore();

  return (
    <div className="glass rounded-xl shadow-lg p-3 space-y-4">
      {/* View Mode Selection */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          View Mode
        </h3>
        <div className="grid grid-cols-3 gap-1.5">
          {viewModes.map((mode) => {
            const Icon = mode.icon;
            const isActive = viewMode === mode.id;
            return (
              <button
                key={mode.id}
                className={`
                  flex flex-col items-center gap-1 p-2 rounded-lg transition-all
                  ${isActive
                    ? 'bg-indigo-500 text-white shadow-md'
                    : 'hover:bg-white/50 text-gray-600'
                  }
                `}
                onClick={() => setViewMode(mode.id)}
                title={mode.description}
              >
                <Icon size={16} />
                <span className="text-xs font-medium">{mode.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Split Screen Agent Selector */}
      {viewMode === ViewMode.SPLIT_SCREEN && (
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Agent POV
          </h3>
          <div className="flex gap-1.5">
            {agents.map((agent) => (
              <button
                key={agent.id}
                className={`
                  flex-1 py-1.5 px-2 rounded-md text-xs font-medium transition-all
                  ${selectedAgentForSplit === agent.id
                    ? 'text-white shadow-md'
                    : 'bg-white/50 text-gray-600 hover:bg-white/70'
                  }
                `}
                style={{
                  backgroundColor: selectedAgentForSplit === agent.id ? agent.color : undefined,
                }}
                onClick={() => setSelectedAgentForSplit(agent.id)}
              >
                {agent.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Simulation Controls */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Simulation
        </h3>
        <div className="flex items-center gap-2">
          {/* Play/Pause */}
          <button
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-sm
              transition-all
              ${isSimulationRunning
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-green-500 text-white hover:bg-green-600'
              }
            `}
            onClick={() => setSimulationRunning(!isSimulationRunning)}
          >
            {isSimulationRunning ? (
              <>
                <Pause size={14} />
                Pause
              </>
            ) : (
              <>
                <Play size={14} />
                Start
              </>
            )}
          </button>

          {/* Speed */}
          <div className="flex items-center gap-1 ml-auto">
            <FastForward size={14} className="text-gray-400" />
            {speedOptions.map((option) => (
              <button
                key={option.value}
                className={`
                  px-2 py-1 rounded text-xs font-medium transition-all
                  ${simulationSpeed === option.value
                    ? 'bg-indigo-500 text-white'
                    : 'bg-white/50 text-gray-600 hover:bg-white/70'
                  }
                `}
                onClick={() => setSimulationSpeed(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="pt-2 border-t border-white/20">
        <div className="text-xs text-gray-500 space-y-1">
          <p><span className="font-medium">Laser:</span> Hold both mouse buttons</p>
          <p><span className="font-medium">Orbit:</span> Left-click drag</p>
          <p><span className="font-medium">Pan:</span> Right-click drag</p>
          <p><span className="font-medium">Zoom:</span> Scroll wheel</p>
        </div>
      </div>
    </div>
  );
}
