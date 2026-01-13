import { useState, useMemo } from 'react';
import {
  X,
  AlertTriangle,
  Zap,
  BookOpen,
  ArrowRight,
  MessageSquare,
  Box,
  CheckCircle2,
  Clock,
  TrendingUp,
  Users,
} from 'lucide-react';
import useArenaStore, { InsightType, Priority } from '../../store/useArenaStore';

// Format timestamp
function formatTime(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Kanban Column
// eslint-disable-next-line no-unused-vars
function KanbanColumn({ title, icon: Icon, color, insights }) {
  return (
    <div className="flex-1 min-w-[280px] bg-gray-50 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-4">
        <Icon size={18} className={color} />
        <h3 className="font-semibold text-gray-700">{title}</h3>
        <span className="ml-auto px-2 py-0.5 bg-gray-200 rounded text-xs font-medium text-gray-600">
          {insights.length}
        </span>
      </div>

      <div className="space-y-3">
        {insights.map((insight) => {
          const priorityConfig = {
            [Priority.CRITICAL]: 'border-red-500 bg-red-50',
            [Priority.HIGH]: 'border-orange-500 bg-orange-50',
            [Priority.MEDIUM]: 'border-yellow-500 bg-yellow-50',
            [Priority.LOW]: 'border-gray-400 bg-gray-50',
          };

          return (
            <div
              key={insight.id}
              className={`p-3 rounded-lg border-l-4 bg-white shadow-sm ${priorityConfig[insight.priority]}`}
            >
              <h4 className="font-medium text-sm text-gray-800 mb-1">
                {insight.title}
              </h4>
              <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                {insight.description}
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Box size={10} />
                <span>{insight.componentId}</span>
                <span className="ml-auto">{formatTime(insight.timestamp)}</span>
              </div>
            </div>
          );
        })}

        {insights.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <p className="text-sm">No items</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Rationale Flow Node
function FlowNode({ content, color }) {
  return (
    <div className={`px-3 py-2 rounded-lg ${color} text-xs font-medium max-w-[150px] text-center`}>
      {content}
    </div>
  );
}

// Rationale Flow Item
function RationaleFlow({ insight, messages }) {
  const sourceMessage = messages.find((m) =>
    insight.sourceMessageIds?.includes(m.id)
  );

  return (
    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
      {/* Trigger Message */}
      <FlowNode
        content={sourceMessage?.text?.substring(0, 40) + '...' || 'Agent observation'}
        color="bg-blue-100 text-blue-700"
      />

      <ArrowRight size={16} className="text-gray-400 flex-shrink-0" />

      {/* Component */}
      <FlowNode
        content={insight.componentId}
        color="bg-purple-100 text-purple-700"
      />

      <ArrowRight size={16} className="text-gray-400 flex-shrink-0" />

      {/* Decision/Insight */}
      <FlowNode
        content={insight.title?.substring(0, 40) || 'Design insight'}
        color="bg-green-100 text-green-700"
      />
    </div>
  );
}

// Timeline Chart
function TimelineChart({ messages, agents }) {
  // Group messages by minute
  const timelineData = useMemo(() => {
    if (messages.length === 0) return [];

    const grouped = {};
    messages.forEach((msg) => {
      const minute = Math.floor(msg.timestamp / 60000);
      if (!grouped[minute]) {
        grouped[minute] = { total: 0, byAgent: {} };
      }
      grouped[minute].total++;
      grouped[minute].byAgent[msg.agentId] = (grouped[minute].byAgent[msg.agentId] || 0) + 1;
    });

    return Object.entries(grouped)
      .sort(([a], [b]) => a - b)
      .map(([minute, data]) => ({
        minute: parseInt(minute),
        ...data,
      }));
  }, [messages]);

  if (timelineData.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p className="text-sm">No activity data yet</p>
      </div>
    );
  }

  const maxCount = Math.max(...timelineData.map((d) => d.total), 1);

  return (
    <div className="space-y-4">
      {/* Chart */}
      <div className="flex items-end gap-1 h-32">
        {timelineData.map((data, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            {/* Stacked bars by agent */}
            <div
              className="w-full flex flex-col-reverse rounded-t"
              style={{ height: `${(data.total / maxCount) * 100}%` }}
            >
              {agents.map((agent) => {
                const count = data.byAgent[agent.id] || 0;
                if (count === 0) return null;
                return (
                  <div
                    key={agent.id}
                    className="w-full"
                    style={{
                      height: `${(count / data.total) * 100}%`,
                      backgroundColor: agent.color,
                      minHeight: count > 0 ? '4px' : 0,
                    }}
                  />
                );
              })}
            </div>
            <span className="text-xs text-gray-400">
              {i === 0 || i === timelineData.length - 1 ? `${data.total}` : ''}
            </span>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4">
        {agents.map((agent) => (
          <div key={agent.id} className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded"
              style={{ backgroundColor: agent.color }}
            />
            <span className="text-xs text-gray-600">{agent.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Stats Card
// eslint-disable-next-line no-unused-vars
function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon size={20} className="text-white" />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
          <p className="text-xs text-gray-500">{label}</p>
        </div>
      </div>
    </div>
  );
}

export default function MeetingSummary({ onClose }) {
  const [activeTab, setActiveTab] = useState('kanban');
  const { insights, chatMessages, agents } = useArenaStore();

  // Group insights by type
  const insightsByType = useMemo(() => ({
    [InsightType.RISK]: insights.filter((i) => i.type === InsightType.RISK),
    [InsightType.ACTION]: insights.filter((i) => i.type === InsightType.ACTION),
    [InsightType.RATIONALE]: insights.filter((i) => i.type === InsightType.RATIONALE),
  }), [insights]);

  // Calculate stats
  const stats = useMemo(() => {
    const criticalCount = insights.filter((i) => i.priority === Priority.CRITICAL).length;
    const uniqueComponents = new Set(insights.map((i) => i.componentId)).size;
    const avgMessagesPerAgent = chatMessages.length / (agents.length || 1);

    return {
      totalInsights: insights.length,
      criticalCount,
      uniqueComponents,
      avgMessagesPerAgent: avgMessagesPerAgent.toFixed(1),
      totalMessages: chatMessages.length,
    };
  }, [insights, chatMessages, agents]);

  const tabs = [
    { id: 'kanban', label: 'Insight Board' },
    { id: 'rationale', label: 'Rationale Flows' },
    { id: 'analysis', label: 'Conversation Analysis' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-[95vw] h-[90vh] max-w-7xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Meeting Summary</h2>
            <p className="text-sm text-gray-500">Design Review Session Analysis</p>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`
                  px-4 py-2 rounded-md text-sm font-medium transition-all
                  ${activeTab === tab.id
                    ? 'bg-white text-gray-800 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                  }
                `}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={onClose}
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Stats Row */}
        <div className="px-6 py-4 border-b bg-gray-50">
          <div className="grid grid-cols-5 gap-4">
            <StatCard
              icon={CheckCircle2}
              label="Total Insights"
              value={stats.totalInsights}
              color="bg-indigo-500"
            />
            <StatCard
              icon={AlertTriangle}
              label="Critical Issues"
              value={stats.criticalCount}
              color="bg-red-500"
            />
            <StatCard
              icon={Box}
              label="Components Reviewed"
              value={stats.uniqueComponents}
              color="bg-purple-500"
            />
            <StatCard
              icon={MessageSquare}
              label="Total Messages"
              value={stats.totalMessages}
              color="bg-blue-500"
            />
            <StatCard
              icon={Users}
              label="Avg Messages/Agent"
              value={stats.avgMessagesPerAgent}
              color="bg-green-500"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {activeTab === 'kanban' && (
            <div className="flex gap-4 min-h-full">
              <KanbanColumn
                title="Risks"
                icon={AlertTriangle}
                color="text-red-500"
                insights={insightsByType[InsightType.RISK]}
              />
              <KanbanColumn
                title="Actions"
                icon={Zap}
                color="text-blue-500"
                insights={insightsByType[InsightType.ACTION]}
              />
              <KanbanColumn
                title="Rationale"
                icon={BookOpen}
                color="text-purple-500"
                insights={insightsByType[InsightType.RATIONALE]}
              />
            </div>
          )}

          {activeTab === 'rationale' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700 mb-4">
                Decision Traceability
              </h3>
              {insights.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <BookOpen size={32} className="mx-auto mb-2 opacity-50" />
                  <p>No rationale flows available</p>
                  <p className="text-sm">Run the simulation to generate insights</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {insights.slice(0, 10).map((insight) => (
                    <RationaleFlow
                      key={insight.id}
                      insight={insight}
                      messages={chatMessages}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'analysis' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <TrendingUp size={18} />
                  Participant Activity Over Time
                </h3>
                <div className="bg-gray-50 rounded-xl p-6">
                  <TimelineChart messages={chatMessages} agents={agents} />
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700 mb-4">
                  Agent Contribution Summary
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {agents.map((agent) => {
                    const agentMessages = chatMessages.filter(
                      (m) => m.agentId === agent.id
                    );
                    const agentInsights = insights.filter(
                      (i) => i.agentId === agent.id
                    );

                    return (
                      <div
                        key={agent.id}
                        className="bg-gray-50 rounded-xl p-4"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: agent.color }}
                          />
                          <span className="font-semibold text-gray-700">
                            {agent.name}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-gray-500">Messages</p>
                            <p className="font-bold text-gray-800">
                              {agentMessages.length}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Insights</p>
                            <p className="font-bold text-gray-800">
                              {agentInsights.length}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Total Dwell</p>
                            <p className="font-bold text-gray-800">
                              {Object.values(agent.dwellTimes)
                                .reduce((a, b) => a + b, 0)
                                .toFixed(1)}s
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">POIs Visited</p>
                            <p className="font-bold text-gray-800">
                              {Object.keys(agent.dwellTimes).length}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t bg-gray-50 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Session started at {new Date().toLocaleTimeString()}
          </p>
          <button
            className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm font-medium transition-colors"
            onClick={onClose}
          >
            Close Summary
          </button>
        </div>
      </div>
    </div>
  );
}
