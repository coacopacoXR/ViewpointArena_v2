import { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Lightbulb,
  AlertTriangle,
  Zap,
  BookOpen,
  ExternalLink,
  Clock,
} from 'lucide-react';
import useArenaStore, { InsightType, Priority } from '../../store/useArenaStore';

// Format timestamp
function formatTime(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

// Chat Message Component
function ChatMessage({ message, isHighlighted }) {
  const { setSelectedComponent, setHoveredComponent } = useArenaStore();

  return (
    <div
      className={`
        p-3 rounded-lg transition-all duration-200
        ${isHighlighted ? 'bg-yellow-100 ring-2 ring-yellow-400' : 'bg-white/50 hover:bg-white/70'}
      `}
      onMouseEnter={() => message.componentId && setHoveredComponent(message.componentId)}
      onMouseLeave={() => setHoveredComponent(null)}
      onClick={() => message.componentId && setSelectedComponent(message.componentId)}
    >
      <div className="flex items-start gap-2">
        {/* Agent indicator */}
        <div
          className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
          style={{ backgroundColor: message.agentColor }}
        />

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1">
            <span
              className="font-semibold text-sm"
              style={{ color: message.agentColor }}
            >
              {message.agentName}
            </span>
            <span className="text-xs text-gray-400">
              {formatTime(message.timestamp)}
            </span>
            {message.componentId && (
              <span className="text-xs px-1.5 py-0.5 bg-gray-100 rounded text-gray-500">
                {message.componentId}
              </span>
            )}
          </div>

          {/* Message text */}
          <p className="text-sm text-gray-700 leading-relaxed">{message.text}</p>
        </div>
      </div>
    </div>
  );
}

// Insight Card Component
function InsightCard({ insight, onHover }) {
  const { setSelectedComponent, setHighlightedMessages } = useArenaStore();

  const typeConfig = {
    [InsightType.RISK]: {
      icon: AlertTriangle,
      color: 'text-red-500',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-500',
      label: 'Risk',
    },
    [InsightType.ACTION]: {
      icon: Zap,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-500',
      label: 'Action',
    },
    [InsightType.RATIONALE]: {
      icon: BookOpen,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-500',
      label: 'Rationale',
    },
  };

  const config = typeConfig[insight.type] || typeConfig[InsightType.RATIONALE];
  const Icon = config.icon;

  const priorityConfig = {
    [Priority.CRITICAL]: { color: 'bg-red-500', label: 'Critical' },
    [Priority.HIGH]: { color: 'bg-orange-500', label: 'High' },
    [Priority.MEDIUM]: { color: 'bg-yellow-500', label: 'Medium' },
    [Priority.LOW]: { color: 'bg-gray-400', label: 'Low' },
  };

  const priority = priorityConfig[insight.priority] || priorityConfig[Priority.MEDIUM];

  return (
    <div
      className={`
        insight-card p-3 rounded-lg cursor-pointer
        ${config.bgColor} border-l-4 ${config.borderColor}
      `}
      onClick={() => insight.componentId && setSelectedComponent(insight.componentId)}
      onMouseEnter={() => {
        onHover(insight);
        setHighlightedMessages(insight.sourceMessageIds || []);
      }}
      onMouseLeave={() => {
        onHover(null);
        setHighlightedMessages([]);
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <Icon size={16} className={config.color} />
        <span className={`text-xs font-semibold uppercase ${config.color}`}>
          {config.label}
        </span>
        <span className={`ml-auto text-xs px-1.5 py-0.5 rounded text-white ${priority.color}`}>
          {priority.label}
        </span>
      </div>

      {/* Title */}
      <h4 className="font-medium text-sm text-gray-800 mb-1">{insight.title}</h4>

      {/* Description */}
      <p className="text-xs text-gray-600 mb-2">{insight.description}</p>

      {/* Meta */}
      <div className="flex items-center gap-2 text-xs text-gray-500">
        {insight.componentId && (
          <span className="flex items-center gap-1">
            <ExternalLink size={10} />
            {insight.componentId}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Clock size={10} />
          {formatTime(insight.timestamp)}
        </span>
      </div>

      {/* Expanded details */}
      {(insight.impact || insight.mitigation) && (
        <div className="mt-2 pt-2 border-t border-gray-200 space-y-1">
          {insight.impact && (
            <div className="text-xs">
              <span className="font-medium text-gray-600">Impact:</span>{' '}
              <span className="text-gray-500">{insight.impact}</span>
            </div>
          )}
          {insight.mitigation && (
            <div className="text-xs">
              <span className="font-medium text-gray-600">Mitigation:</span>{' '}
              <span className="text-gray-500">{insight.mitigation}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ConversationPanel() {
  const [activeTab, setActiveTab] = useState('transcript');
  const [, setHoveredInsight] = useState(null);
  const scrollRef = useRef(null);

  const { chatMessages, insights, highlightedMessageIds } = useArenaStore();

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current && activeTab === 'transcript') {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages, activeTab]);

  const tabs = [
    { id: 'transcript', label: 'Live Transcript', icon: MessageSquare, count: chatMessages.length },
    { id: 'insights', label: 'Active Insights', icon: Lightbulb, count: insights.length },
  ];

  return (
    <div className="glass rounded-xl shadow-lg flex flex-col h-full max-h-[500px]">
      {/* Tab Header */}
      <div className="flex border-b border-white/20">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`
                flex-1 flex items-center justify-center gap-2 px-4 py-3
                text-sm font-medium transition-all
                ${activeTab === tab.id
                  ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white/30'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-white/20'
                }
              `}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={16} />
              {tab.label}
              {tab.count > 0 && (
                <span className={`
                  px-1.5 py-0.5 rounded-full text-xs
                  ${activeTab === tab.id ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-500'}
                `}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2">
        {activeTab === 'transcript' && (
          <>
            {chatMessages.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <MessageSquare size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">No messages yet</p>
                <p className="text-xs">Start the simulation to see agent dialogue</p>
              </div>
            ) : (
              chatMessages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  isHighlighted={highlightedMessageIds.includes(message.id)}
                />
              ))
            )}
          </>
        )}

        {activeTab === 'insights' && (
          <>
            {insights.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Lightbulb size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">No insights extracted yet</p>
                <p className="text-xs">Insights are generated from agent observations</p>
              </div>
            ) : (
              insights.map((insight) => (
                <InsightCard
                  key={insight.id}
                  insight={insight}
                  onHover={setHoveredInsight}
                />
              ))
            )}
          </>
        )}
      </div>

      {/* Footer stats */}
      <div className="px-3 py-2 border-t border-white/20 flex items-center justify-between text-xs text-gray-500">
        <span>{chatMessages.length} messages</span>
        <span>{insights.length} insights extracted</span>
      </div>
    </div>
  );
}
