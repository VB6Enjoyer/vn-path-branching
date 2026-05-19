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
    <div className="border-2 rounded-lg shadow-lg w-48 group" style={{ borderColor: 'var(--note-color)', backgroundColor: 'var(--text-bg)' }}>
      <Handle type="target" position={Position.Top} className="w-5 h-5 border-2 border-gray-900 dark:border-gray-100" style={{ backgroundColor: 'var(--note-color)' }} />

      <div className="p-1.5 rounded-t-sm font-bold text-xs flex justify-between items-center" style={{ backgroundColor: 'var(--note-color)', color: 'var(--text-bg)' }}>
        <span>Note / Event</span>
        <button
          onClick={handleDelete}
          className="hover:text-red-300 hover:opacity-80 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
          title="Delete Node (Shift+Click to bypass confirm)"
        >
          <Trash2 size={12} />
        </button>
      </div>

      <div className="p-2">
        <textarea
          className="w-full text-sm p-2 bg-transparent border-none focus:ring-0 resize-none nodrag"
          style={{ color: 'var(--text-color)' }}
          rows={3}
          value={content}
          onChange={(e) => updateContent(e.target.value)}
          placeholder="Enter text..."
        />
      </div>

      <Handle type="source" position={Position.Bottom} className="w-5 h-5 border-2 border-gray-900 dark:border-gray-100 hover:scale-110 transition-transform" style={{ backgroundColor: 'var(--note-color)' }} />
    </div>
  );
}
