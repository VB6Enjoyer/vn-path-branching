import React, { useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';

export function TextNode({ data, id }: NodeProps) {
  const [content, setContent] = useState<string>((data.content as string) || 'Note or context...');

  const updateContent = (value: string) => {
    setContent(value);
    if (typeof data.onContentChange === 'function') {
      data.onContentChange(id, value);
    }
  };

  return (
    <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg shadow-lg w-48">
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-yellow-500" />

      <div className="bg-yellow-400 text-yellow-900 p-1.5 rounded-t-sm font-bold text-xs">
        Note / Event
      </div>

      <div className="p-2">
        <textarea
          className="w-full text-sm p-2 bg-transparent border-none focus:ring-0 resize-none nodrag"
          rows={3}
          value={content}
          onChange={(e) => updateContent(e.target.value)}
          placeholder="Enter text..."
        />
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-yellow-500" />
    </div>
  );
}
