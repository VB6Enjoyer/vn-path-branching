import React, { useState } from 'react';
import { NodeProps, NodeResizer, useReactFlow } from '@xyflow/react';
import { Trash2, Image as ImageIcon, Check, X } from 'lucide-react';

export function DecorativeNode({ data, id, selected }: NodeProps) {
  const mediaUrl = (data.mediaUrl as string) || '';
  const [showInput, setShowInput] = useState<boolean>(!data.mediaUrl);
  const [tempUrl, setTempUrl] = useState<string>((data.mediaUrl as string) || '');
  const { setNodes } = useReactFlow();

  const updateNodeData = (newUrl: string) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: { ...node.data, mediaUrl: newUrl },
          };
        }
        return node;
      })
    );
  };

  const handleSaveUrl = () => {
    updateNodeData(tempUrl);
    if (tempUrl.trim() !== '') {
      setShowInput(false);
    }
  };

  const handleDelete = () => {
    setNodes((nds) => nds.filter((node) => node.id !== id));
  };

  const isBlurred = !!data.isBlurred;
  const isLocked = !!data.isLocked;

  return (
    <div className={`relative group ${isBlurred ? 'blur-md pointer-events-none' : ''}`}>
      {!isLocked && (
        <NodeResizer
          color="var(--path-highlight-color)"
          isVisible={selected}
          minWidth={100}
          minHeight={100}
        />
      )}

      {mediaUrl && !showInput ? (
        <div
          className="w-full h-full min-w-[100px] min-h-[100px] flex items-center justify-center rounded-lg overflow-hidden border-2 border-transparent hover:border-dashed hover:border-gray-400 dark:hover:border-gray-600 transition-colors"
          onDoubleClick={() => !isLocked && setShowInput(true)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={mediaUrl}
            alt="Decoration"
            className="w-full h-full object-contain pointer-events-none"
            onError={() => {
              updateNodeData('');
              setShowInput(true);
              alert("Failed to load image. Please check the URL.");
            }}
          />
        </div>
      ) : (
        <div className="p-4 bg-[var(--node-bg)] border-2 border-dashed border-gray-400 dark:border-gray-600 rounded-xl shadow-lg min-w-[200px] flex flex-col items-center justify-center gap-3">
          <ImageIcon className="text-gray-400" size={32} />
          <div className="flex gap-1 w-full">
            <input
              type="text"
              value={tempUrl}
              onChange={(e) => setTempUrl(e.target.value)}
              placeholder="Paste Image URL..."
              className="flex-1 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-2 py-1 text-[var(--text-color)]"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveUrl();
                if (e.key === 'Escape') setShowInput(false);
              }}
              autoFocus
            />
            <button
              onClick={handleSaveUrl}
              className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              <Check size={16} />
            </button>
            {mediaUrl && (
              <button
                onClick={() => {
                  setTempUrl(mediaUrl);
                  setShowInput(false);
                }}
                className="p-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <p className="text-xs text-gray-500 text-center">Enter a URL to display a decorative image.</p>
        </div>
      )}

      {/* Delete button (visible when selected or hovered) */}
      <div
        className={`absolute -top-3 -right-3 opacity-0 group-hover:opacity-100 ${selected ? 'opacity-100' : ''} transition-opacity z-10 ${isLocked ? 'hidden' : ''}`}
      >
        <button
          className="bg-white dark:bg-gray-800 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full p-1.5 shadow border border-red-100 dark:border-red-900 transition-colors"
          onClick={handleDelete}
          title="Delete Decoration"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
