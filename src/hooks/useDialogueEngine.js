import { useEffect, useRef, useCallback } from 'react';
import useArenaStore, { AgentBehavior, InsightType, Priority } from '../store/useArenaStore';

// Dialogue templates based on POI and context
const dialogueTemplates = {
  'osc-1-knob': [
    { text: "The OSC 1 knob placement follows standard synthesizer ergonomics.", type: 'observation' },
    { text: "I'm noticing the frequency range indicator is quite small. Might be hard to read in dim studio lighting.", type: 'concern' },
    { text: "The tactile feedback on this encoder feels premium - good haptic response.", type: 'positive' },
  ],
  'osc-2-knob': [
    { text: "OSC 2 spacing from OSC 1 looks tight. Users might accidentally adjust both during performance.", type: 'concern', insight: true },
    { text: "The color differentiation between oscillators is subtle but effective.", type: 'observation' },
  ],
  'osc-mix-knob': [
    { text: "Mix control is well-positioned between the two oscillators - intuitive layout.", type: 'positive' },
    { text: "This knob is smaller than the main controls. Intentional hierarchy?", type: 'question' },
  ],
  'filter-cutoff': [
    { text: "Filter cutoff has good travel range. The sweep feels smooth across the full spectrum.", type: 'positive' },
    { text: "The cutoff label placement might get obscured by the user's hand during adjustment.", type: 'concern', insight: true },
  ],
  'filter-resonance': [
    { text: "Resonance control proximity to cutoff enables one-handed filter manipulation.", type: 'positive' },
    { text: "At extreme resonance settings, this could benefit from a visual warning indicator.", type: 'suggestion', insight: true },
  ],
  'filter-env': [
    { text: "Envelope amount positioned logically below the main filter controls.", type: 'observation' },
  ],
  'master-volume': [
    { text: "The Master Volume clearance looks tight for gloved hands. Consider increasing knob diameter.", type: 'concern', insight: true },
    { text: "Master volume is appropriately the largest control - establishes clear visual hierarchy.", type: 'positive' },
    { text: "Red color coding for master level is a good safety indicator.", type: 'positive' },
  ],
  'master-tune': [
    { text: "Master tune is recessed - good for preventing accidental adjustments mid-performance.", type: 'positive' },
  ],
  'main-screen': [
    { text: "Display viewing angle seems optimal for standing operation.", type: 'positive' },
    { text: "Screen brightness might need adjustment range for different lighting conditions.", type: 'concern', insight: true },
    { text: "The information density on the display is well-balanced - not overwhelming.", type: 'positive' },
  ],
  'led-strip': [
    { text: "LED indicators provide good at-a-glance system status.", type: 'positive' },
    { text: "The color progression from green to red is intuitive for level monitoring.", type: 'observation' },
  ],
  'audio-out': [
    { text: "Audio outputs are easily accessible from the rear panel.", type: 'positive' },
    { text: "Dual output jacks allow for stereo or split signal routing.", type: 'observation' },
  ],
  'midi-ports': [
    { text: "MIDI port spacing is sufficient for standard DIN connectors.", type: 'positive' },
    { text: "Consider adding MIDI activity LEDs near the ports for troubleshooting.", type: 'suggestion', insight: true },
  ],
  'usb-port': [
    { text: "USB-C would be preferable to this USB-A port for modern studio integration.", type: 'concern', insight: true },
    { text: "USB placement on the back prevents cable interference during performance.", type: 'positive' },
  ],
  'main-body': [
    { text: "The chassis dimensions fit standard 19-inch rack mounting with adapters.", type: 'observation' },
    { text: "Material choice provides good rigidity while keeping weight manageable.", type: 'positive' },
  ],
  'side-panel-left': [
    { text: "Wood side panels add warmth to the industrial aesthetic.", type: 'positive' },
    { text: "Left panel could incorporate a carrying handle for portability.", type: 'suggestion' },
  ],
  'side-panel-right': [
    { text: "Matching panels maintain visual symmetry.", type: 'observation' },
  ],
};

// Insight extraction patterns
const insightPatterns = [
  {
    keywords: ['tight', 'clearance', 'spacing', 'close'],
    type: InsightType.RISK,
    priority: Priority.HIGH,
    impact: 'Ergonomic issue may affect usability',
    mitigation: 'Increase spacing or component size',
  },
  {
    keywords: ['hard to read', 'obscured', 'visibility', 'dim'],
    type: InsightType.RISK,
    priority: Priority.MEDIUM,
    impact: 'Visibility concern in certain conditions',
    mitigation: 'Improve labeling or add illumination',
  },
  {
    keywords: ['consider', 'could benefit', 'might need', 'would be preferable'],
    type: InsightType.ACTION,
    priority: Priority.MEDIUM,
    impact: 'Enhancement opportunity identified',
    mitigation: 'Evaluate feasibility and implement',
  },
  {
    keywords: ['warning', 'safety', 'prevent', 'avoid'],
    type: InsightType.RISK,
    priority: Priority.CRITICAL,
    impact: 'Potential safety or operational risk',
    mitigation: 'Add protective measures or warnings',
  },
];

export default function useDialogueEngine() {
  const {
    agents,
    isSimulationRunning,
    simulationSpeed,
    addChatMessage,
    addInsight,
  } = useArenaStore();

  const lastMessageTime = useRef({});
  const usedTemplates = useRef({});

  // Extract insight from message
  const extractInsight = useCallback((message, agentId, componentId) => {
    for (const pattern of insightPatterns) {
      const hasKeyword = pattern.keywords.some((kw) =>
        message.toLowerCase().includes(kw)
      );

      if (hasKeyword) {
        addInsight({
          type: pattern.type,
          priority: pattern.priority,
          componentId,
          agentId,
          sourceMessageIds: [message.id],
          title: message.text.substring(0, 50) + (message.text.length > 50 ? '...' : ''),
          description: message.text,
          impact: pattern.impact,
          mitigation: pattern.mitigation,
          designDriver: `${componentId} review by ${agentId}`,
        });
        return true;
      }
    }
    return false;
  }, [addInsight]);

  // Generate dialogue for an agent at a POI
  const generateDialogue = useCallback((agent) => {
    const templates = dialogueTemplates[agent.targetPoiId];
    if (!templates) return null;

    // Track used templates per agent-poi combination
    const key = `${agent.id}-${agent.targetPoiId}`;
    if (!usedTemplates.current[key]) {
      usedTemplates.current[key] = new Set();
    }

    // Find unused template
    const availableTemplates = templates.filter(
      (_, i) => !usedTemplates.current[key].has(i)
    );

    if (availableTemplates.length === 0) return null;

    const templateIndex = Math.floor(Math.random() * availableTemplates.length);
    const template = availableTemplates[templateIndex];
    const originalIndex = templates.indexOf(template);

    usedTemplates.current[key].add(originalIndex);

    return template;
  }, []);

  // Main dialogue loop
  useEffect(() => {
    if (!isSimulationRunning) return;

    const interval = setInterval(() => {
      const now = Date.now();

      agents.forEach((agent) => {
        // Only generate dialogue when inspecting
        if (agent.behavior !== AgentBehavior.INSPECTING) return;

        // Rate limit per agent
        const lastTime = lastMessageTime.current[agent.id] || 0;
        const cooldown = (3000 + Math.random() * 4000) / simulationSpeed;

        if (now - lastTime < cooldown) return;

        const template = generateDialogue(agent);
        if (!template) return;

        lastMessageTime.current[agent.id] = now;

        // Add message
        const messageId = addChatMessage({
          agentId: agent.id,
          agentName: agent.name,
          agentColor: agent.color,
          text: template.text,
          type: template.type,
          componentId: agent.targetPoiId,
        });

        // Extract insight if applicable
        if (template.insight) {
          setTimeout(() => {
            extractInsight(
              { id: messageId, text: template.text },
              agent.id,
              agent.targetPoiId
            );
          }, 1000 / simulationSpeed);
        }
      });
    }, 500);

    return () => clearInterval(interval);
  }, [
    agents,
    isSimulationRunning,
    simulationSpeed,
    generateDialogue,
    addChatMessage,
    extractInsight,
  ]);

  // Reset templates when simulation restarts
  useEffect(() => {
    if (isSimulationRunning) {
      usedTemplates.current = {};
      lastMessageTime.current = {};
    }
  }, [isSimulationRunning]);

  return null;
}
