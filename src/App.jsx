import { useState } from 'react';
import Scene from './components/scene/Scene';
import Header from './components/ui/Header';
import SceneTreePanel from './components/ui/SceneTreePanel';
import ViewModeControls from './components/ui/ViewModeControls';
import ConversationPanel from './components/ui/ConversationPanel';
import AgentStatusPanel from './components/ui/AgentStatusPanel';
import MeetingSummary from './components/overlays/MeetingSummary';
import useDialogueEngine from './hooks/useDialogueEngine';
import useAgentSimulation from './hooks/useAgentSimulation';
import useArenaStore, { ViewMode } from './store/useArenaStore';

function App() {
  const [showSummary, setShowSummary] = useState(false);
  const { viewMode } = useArenaStore();

  // Initialize hooks
  useDialogueEngine();
  useAgentSimulation();

  return (
    <div className="h-screen w-screen flex flex-col bg-arena-bg overflow-hidden">
      {/* Header */}
      <Header onOpenSummary={() => setShowSummary(true)} />

      {/* Main content */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Left sidebar */}
        <div className="absolute left-4 top-4 z-10 flex flex-col gap-4">
          <SceneTreePanel />
          <AgentStatusPanel />
        </div>

        {/* 3D Scene */}
        <div className="flex-1">
          <Scene />

          {/* Split screen labels */}
          {viewMode === ViewMode.SPLIT_SCREEN && (
            <>
              <div className="absolute top-20 left-1/4 transform -translate-x-1/2 z-10">
                <div className="glass px-3 py-1.5 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Your View</span>
                </div>
              </div>
              <div className="absolute top-20 left-3/4 transform -translate-x-1/2 z-10">
                <div className="glass px-3 py-1.5 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Agent POV</span>
                </div>
              </div>
              <div className="absolute top-16 left-1/2 transform -translate-x-1/2 h-[calc(100%-4rem)] w-px bg-gray-300 z-10" />
            </>
          )}
        </div>

        {/* Right sidebar */}
        <div className="absolute right-4 top-4 z-10 flex flex-col gap-4 w-80">
          <ViewModeControls />
          <ConversationPanel />
        </div>
      </div>

      {/* Meeting Summary Overlay */}
      {showSummary && <MeetingSummary onClose={() => setShowSummary(false)} />}
    </div>
  );
}

export default App;
