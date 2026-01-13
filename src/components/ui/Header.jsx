import {
  Boxes,
  LayoutDashboard,
  Settings,
  HelpCircle,
  Crosshair,
} from 'lucide-react';
import useArenaStore, { ViewMode } from '../../store/useArenaStore';

export default function Header({ onOpenSummary }) {
  const {
    laserActive,
    selectedComponentId,
    viewMode,
    isSimulationRunning,
    insights,
  } = useArenaStore();

  const viewModeLabels = {
    [ViewMode.FREE]: 'Free Camera',
    [ViewMode.SPLIT_SCREEN]: 'Split Screen',
    [ViewMode.AI_GUIDED]: 'AI Guided',
    [ViewMode.SYNC_LEADER]: 'Leader Mode',
    [ViewMode.OVERHEAD]: 'Overhead View',
    [ViewMode.HEATMAP]: 'Heatmap View',
  };

  return (
    <header className="glass border-b border-white/20">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Boxes size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-800">Viewpoint Arena</h1>
            <p className="text-xs text-gray-500">Design Review Simulator</p>
          </div>
        </div>

        {/* Center - Status indicators */}
        <div className="flex items-center gap-4">
          {/* View Mode */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/50 rounded-lg">
            <span className="text-xs text-gray-500">Mode:</span>
            <span className="text-sm font-medium text-gray-700">
              {viewModeLabels[viewMode]}
            </span>
          </div>

          {/* Simulation Status */}
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                isSimulationRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-300'
              }`}
            />
            <span className="text-xs text-gray-500">
              {isSimulationRunning ? 'Running' : 'Paused'}
            </span>
          </div>

          {/* Laser Status */}
          {laserActive && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-100 rounded-lg">
              <Crosshair size={14} className="text-red-500" />
              <span className="text-xs font-medium text-red-600">Laser Active</span>
            </div>
          )}

          {/* Selected Component */}
          {selectedComponentId && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-100 rounded-lg">
              <span className="text-xs text-gray-500">Selected:</span>
              <span className="text-sm font-medium text-indigo-700">
                {selectedComponentId}
              </span>
            </div>
          )}
        </div>

        {/* Right - Actions */}
        <div className="flex items-center gap-2">
          {/* Insights count */}
          {insights.length > 0 && (
            <div className="flex items-center gap-1 px-2 py-1 bg-amber-100 rounded-lg mr-2">
              <span className="text-xs font-medium text-amber-700">
                {insights.length} insights
              </span>
            </div>
          )}

          {/* Meeting Summary Button */}
          <button
            className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors font-medium text-sm"
            onClick={onOpenSummary}
          >
            <LayoutDashboard size={16} />
            Meeting Summary
          </button>

          {/* Settings */}
          <button className="p-2 hover:bg-white/50 rounded-lg transition-colors">
            <Settings size={18} className="text-gray-500" />
          </button>

          {/* Help */}
          <button className="p-2 hover:bg-white/50 rounded-lg transition-colors">
            <HelpCircle size={18} className="text-gray-500" />
          </button>
        </div>
      </div>
    </header>
  );
}
