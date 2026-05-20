import React, { useState, useEffect } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Trash2 } from 'lucide-react';

export function OutcomeNode({ data, id }: NodeProps) {
  const [outcome, setOutcome] = useState<string>((data.outcome as string) || 'Ending Name');
  const [type, setType] = useState<string>((data.type as string) || 'neutral');

  // Sync state from parent data changes
  useEffect(() => {
    if (typeof data.outcome === 'string') setTimeout(() => setOutcome(data.outcome), 0);
    if (typeof data.type === 'string') setTimeout(() => setType(data.type), 0);
  }, [data.outcome, data.type]);

  const updateOutcome = (value: string) => {
    setOutcome(value);
    if (typeof data.onOutcomeChange === 'function') {
      data.onOutcomeChange(id, value);
    }
  };

  const updateType = (value: string) => {
    setType(value);
    if (typeof data.onTypeChange === 'function') {
      data.onTypeChange(id, value);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    if (e.shiftKey || window.confirm('Are you sure you want to delete this outcome?')) {
      if (typeof data.onDelete === 'function') {
        data.onDelete(id);
      }
    }
  };

  const getColor = () => {
    switch(type) {
      case 'good': return 'var(--outcome-good-color)';
      case 'bad': return 'var(--outcome-bad-color)';
      default: return 'var(--outcome-neutral-color)';
    }
  };

  const color = getColor();

  return (
    <div className="border-2 rounded-lg shadow-lg w-48 group" style={{ borderColor: color, backgroundColor: 'var(--text-bg)' }}>
      <Handle type="target" position={Position.Top} className="w-5 h-5 border-2 border-gray-900 dark:border-gray-100" style={{ backgroundColor: color }} />

      <div className="p-1.5 rounded-t-sm font-bold text-xs flex justify-between items-center" style={{ backgroundColor: color, color: 'var(--text-bg)' }}>
        <span>Outcome / Ending</span>
        <button
          onClick={handleDelete}
          className="hover:text-red-300 hover:opacity-80 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
          title="Delete Node (Shift+Click to bypass confirm)"
        >
          <Trash2 size={12} />
        </button>
      </div>

      <div className="p-3">
        <input
          className="w-full text-center font-bold text-sm p-1 border-b bg-transparent mb-2 nodrag focus:outline-none"
          style={{ color: 'var(--text-color)', borderColor: color }}
          value={outcome}
          onChange={(e) => updateOutcome(e.target.value)}
          placeholder="Ending Name"
        />

        <select
          className="w-full text-xs p-1 border rounded nodrag focus:outline-none"
          style={{ backgroundColor: 'var(--text-bg)', color: 'var(--text-color)', borderColor: color }}
          value={type}
          onChange={(e) => updateType(e.target.value)}
        >
          <option value="good">Good Ending</option>
          <option value="neutral">Neutral Ending</option>
          <option value="bad">Bad Ending</option>
        </select>
      </div>
    </div>
  );
}
