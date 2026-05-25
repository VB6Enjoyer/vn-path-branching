import React, { useState } from 'react';
import { NodeProps, NodeResizer, useReactFlow } from '@xyflow/react';
import { Trash2, Settings2, Check, X } from 'lucide-react';

export function GroupNode({ id, data, selected }: NodeProps) {
  const isLocked = !!data.isLocked;
  const isBlurred = !!data.isBlurred;

  const [label, setLabel] = useState<string>((data.label as string) || 'Group / Chapter');
  const [bgColor, setBgColor] = useState<string>((data.bgColor as string) || '#808080');
  const [bgOpacity, setBgOpacity] = useState<number>((data.bgOpacity as number) ?? 20);
  const [borderColor, setBorderColor] = useState<string>((data.borderColor as string) || '#808080');
  const [showSettings, setShowSettings] = useState(false);

  const { setNodes } = useReactFlow();

  const updateNodeData = (updates: Record<string, unknown>) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: { ...node.data, ...updates },
          };
        }
        return node;
      })
    );
  };

  const handleSaveSettings = () => {
    updateNodeData({ label, bgColor, bgOpacity, borderColor });
    setShowSettings(false);
  };

  const handleDelete = () => {
    // Delete the group (children stay, they just lose their parent)
    setNodes((nds) => nds.filter((node) => node.id !== id).map(node => {
      if (node.parentId === id) {
        // Convert to absolute position roughly
        return { ...node, parentId: undefined };
      }
      return node;
    }));
  };

  // Convert hex + opacity to rgba string
  const getRgba = (hex: string, opacity: number) => {
    hex = hex.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16) || 128;
    const g = parseInt(hex.substring(2, 4), 16) || 128;
    const b = parseInt(hex.substring(4, 6), 16) || 128;
    return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
  };

  return (
    <div
      className={`w-full h-full relative group transition-all ${isBlurred ? 'blur-md pointer-events-none' : ''}`}
      style={{
        backgroundColor: getRgba(bgColor, bgOpacity),
        border: `2px dashed ${borderColor}`,
        borderRadius: '12px',
        zIndex: -1,
      }}
    >
      {!isLocked && (
        <NodeResizer
          color={borderColor}
          isVisible={selected}
          minWidth={200}
          minHeight={150}
        />
      )}

      {/* Label */}
      <div
        className="absolute top-0 left-0 w-full p-2 text-sm font-bold truncate opacity-60"
        style={{ color: borderColor }}
      >
        {label}
      </div>

      {/* Hover Controls */}
      {!isLocked && (
        <div className={`absolute -top-4 -right-4 flex gap-1 opacity-0 group-hover:opacity-100 ${selected ? 'opacity-100' : ''} transition-opacity z-50`}>
          <button
            className="bg-white dark:bg-gray-800 text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-full p-1.5 shadow border border-gray-200 dark:border-gray-700 transition-colors"
            onClick={() => setShowSettings(!showSettings)}
            title="Group Settings"
          >
            <Settings2 size={14} />
          </button>
          <button
            className="bg-white dark:bg-gray-800 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full p-1.5 shadow border border-red-100 dark:border-red-900 transition-colors"
            onClick={handleDelete}
            title="Delete Group (Keeps contents)"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}

      {/* Settings Popover */}
      {showSettings && !isLocked && (
        <div
          className="absolute -top-4 right-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl rounded-lg p-3 z-[100] w-56 flex flex-col gap-3 nodrag nopan cursor-default"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-1">
            <span className="text-xs font-bold text-gray-700 dark:text-gray-200">Group Settings</span>
            <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-gray-600"><X size={12} /></button>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-bold text-gray-500">Label</label>
            <input
              type="text"
              value={label}
              onChange={e => setLabel(e.target.value)}
              className="text-xs p-1 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-gray-100 w-full"
            />
          </div>

          <div className="flex justify-between items-center">
            <label className="text-[10px] uppercase font-bold text-gray-500">Border Color</label>
            <input
              type="color"
              value={borderColor}
              onChange={e => setBorderColor(e.target.value)}
              className="w-6 h-6 rounded cursor-pointer border-0 p-0"
            />
          </div>

          <div className="flex justify-between items-center">
            <label className="text-[10px] uppercase font-bold text-gray-500">Fill Color</label>
            <input
              type="color"
              value={bgColor}
              onChange={e => setBgColor(e.target.value)}
              className="w-6 h-6 rounded cursor-pointer border-0 p-0"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-bold text-gray-500">Fill Opacity ({bgOpacity}%)</label>
            <input
              type="range"
              min="0" max="100"
              value={bgOpacity}
              onChange={e => setBgOpacity(parseInt(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </div>

          <button
            onClick={handleSaveSettings}
            className="w-full py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition flex justify-center items-center gap-1"
          >
            <Check size={12} /> Apply Changes
          </button>
        </div>
      )}
    </div>
  );
}
