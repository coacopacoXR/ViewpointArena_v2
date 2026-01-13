import { useState } from 'react';
import {
  Bot,
  Navigation,
  Eye,
  Users,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import useArenaStore, { AgentBehavior } from '../../store/useArenaStore';

const behaviorIcons = {
  [AgentBehavior.IDLE]: { icon: Bot, color: 'text-gray-400' },
  [AgentBehavior.MOVING]: { icon: Navigation, color: 'text-yellow-500' },
  [AgentBehavior.INSPECTING]: { icon: Eye, color: 'text-green-500' },
  [AgentBehavior.FOLLOWING]: { icon: Users, color: 'text-blue-500' },
};

// POI options for agent targeting
const poiOptions = [
  { id: 'osc-1-knob', label: 'OSC 1' },
  { id: 'osc-2-knob', label: 'OSC 2' },
  { id: 'osc-mix-knob', label: 'OSC Mix' },
  { id: 'filter-cutoff', label: 'Filter Cutoff' },
  { id: 'filter-resonance', label: 'Filter Res' },
  { id: 'master-volume', label: 'Master Vol' },
  { id: 'main-screen', label: 'Display' },
  { id: 'audio-out', label: 'Audio Out' },
  { id: 'midi-ports', label: 'MIDI' },
  { id: 'usb-port', label: 'USB' },
];

function AgentCard({ agent, allAgents }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { setAgentTarget, setAgentFollowing } = useArenaStore();

  const behavior = behaviorIcons[agent.behavior] || behaviorIcons[AgentBehavior.IDLE];
  const BehaviorIcon = behavior.icon;

  const otherAgents = allAgents.filter((a) => a.id !== agent.id && !a.followingId);

  // If following, show merged state
  if (agent.followingId) {
    return null;
  }

  return (
    <div className="bg-white/50 rounded-lg overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center gap-3 p-3 cursor-pointer hover:bg-white/30 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Agent color indicator */}
        <div
          className="w-3 h-3 rounded-full flex-shrink-0"
          style={{ backgroundColor: agent.color }}
        />

        {/* Name and merged agents */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-gray-800">
              {agent.name}
            </span>
            {agent.mergedWith.length > 0 && (
              <span className="text-xs text-gray-500">
                + {agent.mergedWith.join(', ')}
              </span>
            )}
          </div>
          <div className="text-xs text-gray-500 truncate">
            @ {agent.targetPoiId}
          </div>
        </div>

        {/* Behavior indicator */}
        <div className={`flex items-center gap-1 ${behavior.color}`}>
          <BehaviorIcon size={14} />
          <span className="text-xs font-medium">{agent.behavior}</span>
        </div>

        {/* Expand icon */}
        {isExpanded ? (
          <ChevronUp size={14} className="text-gray-400" />
        ) : (
          <ChevronDown size={14} className="text-gray-400" />
        )}
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-3 pb-3 space-y-3 border-t border-gray-200/50">
          {/* Target selector */}
          <div className="pt-3">
            <label className="text-xs text-gray-500 block mb-1.5">
              Navigate to:
            </label>
            <div className="flex flex-wrap gap-1">
              {poiOptions.map((poi) => (
                <button
                  key={poi.id}
                  className={`
                    px-2 py-1 rounded text-xs transition-all
                    ${agent.targetPoiId === poi.id
                      ? 'text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }
                  `}
                  style={{
                    backgroundColor: agent.targetPoiId === poi.id ? agent.color : undefined,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setAgentTarget(agent.id, poi.id);
                  }}
                >
                  {poi.label}
                </button>
              ))}
            </div>
          </div>

          {/* Follow selector */}
          {otherAgents.length > 0 && (
            <div>
              <label className="text-xs text-gray-500 block mb-1.5">
                Follow agent:
              </label>
              <div className="flex gap-1">
                {otherAgents.map((other) => (
                  <button
                    key={other.id}
                    className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
                    onClick={(e) => {
                      e.stopPropagation();
                      setAgentFollowing(agent.id, other.id);
                    }}
                  >
                    Follow {other.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-gray-100/50 rounded p-2">
              <div className="text-gray-500">Position</div>
              <div className="font-mono text-gray-700">
                {agent.position.map((v) => v.toFixed(1)).join(', ')}
              </div>
            </div>
            <div className="bg-gray-100/50 rounded p-2">
              <div className="text-gray-500">Total Dwell</div>
              <div className="font-mono text-gray-700">
                {Object.values(agent.dwellTimes).reduce((a, b) => a + b, 0).toFixed(1)}s
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AgentStatusPanel() {
  const { agents } = useArenaStore();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const visibleAgents = agents.filter((a) => !a.followingId);

  return (
    <div className="glass rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2 border-b border-white/20 cursor-pointer"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center gap-2">
          <Bot size={16} className="text-gray-500" />
          <h3 className="text-sm font-semibold text-gray-700">AI Agents</h3>
          <span className="text-xs px-1.5 py-0.5 bg-gray-100 rounded text-gray-500">
            {visibleAgents.length}
          </span>
        </div>
        {isCollapsed ? (
          <ChevronDown size={14} className="text-gray-400" />
        ) : (
          <ChevronUp size={14} className="text-gray-400" />
        )}
      </div>

      {/* Agent list */}
      {!isCollapsed && (
        <div className="p-2 space-y-2 max-h-80 overflow-y-auto">
          {agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} allAgents={agents} />
          ))}
        </div>
      )}
    </div>
  );
}
