import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

// View Modes
export const ViewMode = {
  FREE: 'FREE',
  SPLIT_SCREEN: 'SPLIT_SCREEN',
  AI_GUIDED: 'AI_GUIDED',
  SYNC_LEADER: 'SYNC_LEADER',
  OVERHEAD: 'OVERHEAD',
  HEATMAP: 'HEATMAP',
};

// Agent Behaviors
export const AgentBehavior = {
  IDLE: 'IDLE',
  MOVING: 'MOVING',
  INSPECTING: 'INSPECTING',
  FOLLOWING: 'FOLLOWING',
};

// Insight Types
export const InsightType = {
  RISK: 'RISK',
  ACTION: 'ACTION',
  RATIONALE: 'RATIONALE',
};

// Priority Levels
export const Priority = {
  CRITICAL: 'CRITICAL',
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW',
};

// Initial Scene Tree (Synthesizer Assembly)
const initialSceneTree = {
  id: 'root',
  name: 'Synthesizer Assembly',
  visible: true,
  expanded: true,
  children: [
    {
      id: 'chassis',
      name: 'Chassis',
      visible: true,
      expanded: true,
      children: [
        { id: 'main-body', name: 'Main Body', visible: true, children: [] },
        { id: 'side-panel-left', name: 'Side Panel (L)', visible: true, children: [] },
        { id: 'side-panel-right', name: 'Side Panel (R)', visible: true, children: [] },
      ],
    },
    {
      id: 'control-surface',
      name: 'Control Surface',
      visible: true,
      expanded: true,
      children: [
        {
          id: 'oscillators',
          name: 'Oscillator Section',
          visible: true,
          expanded: true,
          children: [
            { id: 'osc-1-knob', name: 'OSC 1 Frequency', visible: true, children: [] },
            { id: 'osc-2-knob', name: 'OSC 2 Frequency', visible: true, children: [] },
            { id: 'osc-mix-knob', name: 'OSC Mix', visible: true, children: [] },
          ],
        },
        {
          id: 'filter-section',
          name: 'Filter Section',
          visible: true,
          expanded: true,
          children: [
            { id: 'filter-cutoff', name: 'Filter Cutoff', visible: true, children: [] },
            { id: 'filter-resonance', name: 'Filter Resonance', visible: true, children: [] },
            { id: 'filter-env', name: 'Filter Envelope', visible: true, children: [] },
          ],
        },
        {
          id: 'master-section',
          name: 'Master Section',
          visible: true,
          expanded: true,
          children: [
            { id: 'master-volume', name: 'Master Volume', visible: true, children: [] },
            { id: 'master-tune', name: 'Master Tune', visible: true, children: [] },
          ],
        },
      ],
    },
    {
      id: 'display-module',
      name: 'Display Module',
      visible: true,
      expanded: false,
      children: [
        { id: 'main-screen', name: 'Main Screen', visible: true, children: [] },
        { id: 'led-strip', name: 'LED Strip', visible: true, children: [] },
      ],
    },
    {
      id: 'io-panel',
      name: 'I/O Panel',
      visible: true,
      expanded: false,
      children: [
        { id: 'audio-out', name: 'Audio Output', visible: true, children: [] },
        { id: 'midi-ports', name: 'MIDI Ports', visible: true, children: [] },
        { id: 'usb-port', name: 'USB Port', visible: true, children: [] },
      ],
    },
  ],
};

// Initial Points of Interest with world coordinates
const initialPOIs = {
  'main-body': { position: [0, 0, 0], description: 'Main chassis body' },
  'side-panel-left': { position: [-2.5, 0, 0], description: 'Left side panel' },
  'side-panel-right': { position: [2.5, 0, 0], description: 'Right side panel' },
  'osc-1-knob': { position: [-1.5, 0.8, 0.8], description: 'Oscillator 1 frequency control' },
  'osc-2-knob': { position: [-0.8, 0.8, 0.8], description: 'Oscillator 2 frequency control' },
  'osc-mix-knob': { position: [-1.15, 0.8, 0.4], description: 'Oscillator mix control' },
  'filter-cutoff': { position: [0.2, 0.8, 0.8], description: 'Filter cutoff frequency' },
  'filter-resonance': { position: [0.9, 0.8, 0.8], description: 'Filter resonance control' },
  'filter-env': { position: [0.55, 0.8, 0.4], description: 'Filter envelope amount' },
  'master-volume': { position: [1.8, 0.8, 0.8], description: 'Master volume output level' },
  'master-tune': { position: [1.8, 0.8, 0.4], description: 'Master tuning adjustment' },
  'main-screen': { position: [0, 1.2, 0.6], description: 'Main display screen' },
  'led-strip': { position: [0, 1.0, 1.0], description: 'Status LED strip' },
  'audio-out': { position: [0, -0.3, -1.2], description: 'Audio output jacks' },
  'midi-ports': { position: [-1, -0.3, -1.2], description: 'MIDI input/output ports' },
  'usb-port': { position: [1, -0.3, -1.2], description: 'USB connectivity port' },
};

// Initial Agents
const initialAgents = [
  {
    id: 'agent-alpha',
    name: 'Alpha',
    color: '#4F46E5',
    behavior: AgentBehavior.IDLE,
    targetPoiId: 'osc-1-knob',
    position: [-1.5, 1.5, 2],
    lookAt: [-1.5, 0.8, 0.8],
    dwellTimes: {},
    followingId: null,
    mergedWith: [],
  },
  {
    id: 'agent-beta',
    name: 'Beta',
    color: '#10B981',
    behavior: AgentBehavior.IDLE,
    targetPoiId: 'filter-cutoff',
    position: [0.2, 1.5, 2],
    lookAt: [0.2, 0.8, 0.8],
    dwellTimes: {},
    followingId: null,
    mergedWith: [],
  },
  {
    id: 'agent-gamma',
    name: 'Gamma',
    color: '#F59E0B',
    behavior: AgentBehavior.IDLE,
    targetPoiId: 'master-volume',
    position: [1.8, 1.5, 2],
    lookAt: [1.8, 0.8, 0.8],
    dwellTimes: {},
    followingId: null,
    mergedWith: [],
  },
];

// Store Creation
const useArenaStore = create(
  subscribeWithSelector((set, get) => ({
    // === VIEW STATE ===
    viewMode: ViewMode.FREE,
    setViewMode: (mode) => set({ viewMode: mode }),

    selectedAgentForSplit: 'agent-alpha',
    setSelectedAgentForSplit: (agentId) => set({ selectedAgentForSplit: agentId }),

    isLeader: false,
    setIsLeader: (isLeader) => set({ isLeader }),

    // === SCENE STATE ===
    sceneTree: initialSceneTree,
    pois: initialPOIs,

    toggleNodeVisibility: (nodeId) => {
      const toggleVisibility = (node) => {
        if (node.id === nodeId) {
          return { ...node, visible: !node.visible };
        }
        if (node.children) {
          return { ...node, children: node.children.map(toggleVisibility) };
        }
        return node;
      };
      set((state) => ({ sceneTree: toggleVisibility(state.sceneTree) }));
    },

    toggleNodeExpanded: (nodeId) => {
      const toggleExpanded = (node) => {
        if (node.id === nodeId) {
          return { ...node, expanded: !node.expanded };
        }
        if (node.children) {
          return { ...node, children: node.children.map(toggleExpanded) };
        }
        return node;
      };
      set((state) => ({ sceneTree: toggleExpanded(state.sceneTree) }));
    },

    selectedComponentId: null,
    setSelectedComponent: (componentId) => set({ selectedComponentId: componentId }),

    hoveredComponentId: null,
    setHoveredComponent: (componentId) => set({ hoveredComponentId: componentId }),

    // === AGENT STATE ===
    agents: initialAgents,

    updateAgentPosition: (agentId, position) => {
      set((state) => ({
        agents: state.agents.map((a) =>
          a.id === agentId ? { ...a, position } : a
        ),
      }));
    },

    updateAgentLookAt: (agentId, lookAt) => {
      set((state) => ({
        agents: state.agents.map((a) =>
          a.id === agentId ? { ...a, lookAt } : a
        ),
      }));
    },

    updateAgentBehavior: (agentId, behavior) => {
      set((state) => ({
        agents: state.agents.map((a) =>
          a.id === agentId ? { ...a, behavior } : a
        ),
      }));
    },

    setAgentTarget: (agentId, targetPoiId) => {
      set((state) => ({
        agents: state.agents.map((a) =>
          a.id === agentId
            ? { ...a, targetPoiId, behavior: AgentBehavior.MOVING }
            : a
        ),
      }));
    },

    setAgentFollowing: (followerId, targetId) => {
      set((state) => {
        const updatedAgents = state.agents.map((a) => {
          if (a.id === followerId) {
            return { ...a, followingId: targetId, behavior: AgentBehavior.FOLLOWING };
          }
          if (a.id === targetId && targetId) {
            const follower = state.agents.find((f) => f.id === followerId);
            return {
              ...a,
              mergedWith: [...a.mergedWith, follower.name],
            };
          }
          return a;
        });
        return { agents: updatedAgents };
      });
    },

    updateAgentDwellTime: (agentId, poiId, additionalTime) => {
      set((state) => ({
        agents: state.agents.map((a) => {
          if (a.id === agentId) {
            const currentDwell = a.dwellTimes[poiId] || 0;
            return {
              ...a,
              dwellTimes: {
                ...a.dwellTimes,
                [poiId]: currentDwell + additionalTime,
              },
            };
          }
          return a;
        }),
      }));
    },

    // Computed: Get aggregate dwell times for heatmap
    getAggregateDwellTimes: () => {
      const state = get();
      const aggregate = {};
      state.agents.forEach((agent) => {
        Object.entries(agent.dwellTimes).forEach(([poiId, time]) => {
          aggregate[poiId] = (aggregate[poiId] || 0) + time;
        });
      });
      return aggregate;
    },

    // === INSIGHTS STATE ===
    insights: [],

    addInsight: (insight) => {
      const id = `insight-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      set((state) => ({
        insights: [
          ...state.insights,
          {
            id,
            timestamp: Date.now(),
            ...insight,
          },
        ],
      }));
      return id;
    },

    updateInsight: (insightId, updates) => {
      set((state) => ({
        insights: state.insights.map((i) =>
          i.id === insightId ? { ...i, ...updates } : i
        ),
      }));
    },

    removeInsight: (insightId) => {
      set((state) => ({
        insights: state.insights.filter((i) => i.id !== insightId),
      }));
    },

    // === CHAT STATE ===
    chatMessages: [],

    addChatMessage: (message) => {
      const id = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      set((state) => ({
        chatMessages: [
          ...state.chatMessages,
          {
            id,
            timestamp: Date.now(),
            ...message,
          },
        ],
      }));
      return id;
    },

    highlightedMessageIds: [],
    setHighlightedMessages: (messageIds) => set({ highlightedMessageIds: messageIds }),

    // === LASER STATE ===
    laserActive: false,
    setLaserActive: (active) => set({ laserActive: active }),

    laserTarget: null,
    setLaserTarget: (target) => set({ laserTarget: target }),

    // === MEETING SUMMARY ===
    showMeetingSummary: false,
    setShowMeetingSummary: (show) => set({ showMeetingSummary: show }),

    // === USER CAMERA STATE (for sync mode) ===
    userCameraPosition: [5, 5, 5],
    userCameraTarget: [0, 0, 0],
    setUserCamera: (position, target) =>
      set({ userCameraPosition: position, userCameraTarget: target }),

    // === SIMULATION CONTROL ===
    isSimulationRunning: false,
    setSimulationRunning: (running) => set({ isSimulationRunning: running }),

    simulationSpeed: 1,
    setSimulationSpeed: (speed) => set({ simulationSpeed: speed }),
  }))
);

export default useArenaStore;
