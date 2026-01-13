import { useState } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Eye,
  EyeOff,
  Box,
  Layers,
} from 'lucide-react';
import useArenaStore from '../../store/useArenaStore';

function TreeNode({ node, depth = 0 }) {
  const {
    toggleNodeVisibility,
    toggleNodeExpanded,
    selectedComponentId,
    setSelectedComponent,
    setHoveredComponent,
  } = useArenaStore();

  const isSelected = selectedComponentId === node.id;
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="select-none">
      <div
        className={`
          flex items-center gap-1 px-2 py-1.5 rounded-md cursor-pointer
          transition-all duration-150 group
          ${isSelected ? 'bg-indigo-500/20 text-indigo-700' : 'hover:bg-white/50'}
        `}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={() => setSelectedComponent(node.id)}
        onMouseEnter={() => setHoveredComponent(node.id)}
        onMouseLeave={() => setHoveredComponent(null)}
      >
        {/* Expand/Collapse */}
        {hasChildren ? (
          <button
            className="p-0.5 hover:bg-black/10 rounded"
            onClick={(e) => {
              e.stopPropagation();
              toggleNodeExpanded(node.id);
            }}
          >
            {node.expanded ? (
              <ChevronDown size={14} className="text-gray-500" />
            ) : (
              <ChevronRight size={14} className="text-gray-500" />
            )}
          </button>
        ) : (
          <span className="w-5" />
        )}

        {/* Icon */}
        {hasChildren ? (
          <Layers size={14} className="text-gray-400" />
        ) : (
          <Box size={14} className="text-gray-400" />
        )}

        {/* Name */}
        <span className={`flex-1 text-sm truncate ${!node.visible ? 'opacity-50' : ''}`}>
          {node.name}
        </span>

        {/* Visibility toggle */}
        <button
          className="p-1 opacity-0 group-hover:opacity-100 hover:bg-black/10 rounded transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            toggleNodeVisibility(node.id);
          }}
        >
          {node.visible ? (
            <Eye size={14} className="text-gray-500" />
          ) : (
            <EyeOff size={14} className="text-gray-400" />
          )}
        </button>
      </div>

      {/* Children */}
      {hasChildren && node.expanded && (
        <div>
          {node.children.map((child) => (
            <TreeNode key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function SceneTreePanel() {
  const { sceneTree, selectedComponentId, pois } = useArenaStore();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const selectedPoi = selectedComponentId ? pois[selectedComponentId] : null;

  return (
    <div
      className={`
        glass rounded-xl shadow-lg overflow-hidden
        transition-all duration-300
        ${isCollapsed ? 'w-12' : 'w-64'}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/20">
        {!isCollapsed && (
          <h3 className="text-sm font-semibold text-gray-700">Scene Tree</h3>
        )}
        <button
          className="p-1 hover:bg-black/10 rounded transition-colors"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? (
            <ChevronRight size={16} className="text-gray-500" />
          ) : (
            <ChevronDown size={16} className="text-gray-500" />
          )}
        </button>
      </div>

      {/* Tree */}
      {!isCollapsed && (
        <div className="max-h-96 overflow-y-auto p-2">
          <TreeNode node={sceneTree} />
        </div>
      )}

      {/* Selected Info */}
      {!isCollapsed && selectedPoi && (
        <div className="border-t border-white/20 p-3">
          <div className="text-xs text-gray-500 mb-1">Selected Component</div>
          <div className="text-sm font-medium text-gray-700">{selectedComponentId}</div>
          <div className="text-xs text-gray-500 mt-1">{selectedPoi.description}</div>
        </div>
      )}
    </div>
  );
}
