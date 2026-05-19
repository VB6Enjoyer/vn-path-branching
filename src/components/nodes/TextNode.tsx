import React, { useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Trash2 } from 'lucide-react';

export function TextNode({ data, id }: NodeProps) {
  const [content, setContent] = useState<string>((data.content as string) || 'Note or context...');

  const updateContent = (value: string) => {
    setContent(value);
    if (typeof data.onContentChange === 'function') {
      data.onContentChange(id, value);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    if (e.shiftKey || window.confirm('Are you sure you want to delete this note?')) {
      if (typeof data.onDelete === 'function') {
        data.onDelete(id);
      }
    }
  };

  return (
    <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg shadow-lg w-48 group">
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-yellow-500" />

      <div className="bg-yellow-400 text-yellow-900 p-1.5 rounded-t-sm font-bold text-xs flex justify-between items-center">
        <span>Note / Event</span>
        <button
          onClick={handleDelete}
          className="text-yellow-800 hover:text-yellow-900 hover:bg-yellow-500 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
          title="Delete Node (Shift+Click to bypass confirm)"
        >
          <Trash2 size={12} />
        </button>
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
