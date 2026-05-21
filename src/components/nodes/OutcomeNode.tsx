import React, { useState, useEffect } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Trash2 } from 'lucide-react';

export function OutcomeNode({ data, id }: NodeProps) {
  const [outcome, setOutcome] = useState<string>((data.outcome as string) || 'Ending Name');
  const [type, setType] = useState<string>((data.type as string) || 'neutral');

  useEffect(() => {
    if (typeof data.outcome === 'string') setTimeout(() => setOutcome(data.outcome as string), 0);
    if (typeof data.type === 'string') setTimeout(() => setType(data.type as string), 0);
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

  const isHighlighted = !!data.isHighlighted;
  const color = getColor();
  const borderColor = isHighlighted ? 'var(--path-highlight-color)' : color;
  const boxShadow = isHighlighted ? '0 0 15px var(--path-highlight-color)' : undefined;
  const isBlurred = !!data.isBlurred;

  return (
    <div className={`border-2 rounded-lg shadow-lg w-48 group transition-all ${isBlurred ? 'blur-[8px] hover:blur-[4px] cursor-pointer' : ''}`} style={{ borderColor, backgroundColor: 'var(--text-bg)', boxShadow, pointerEvents: isBlurred ? 'none' : 'auto' }}>
      <Handle type="target" position={Position.Top} className="w-5 h-5 border-2 border-gray-900 dark:border-gray-100" style={{ backgroundColor: color }} />

      <div className="p-1.5 rounded-t-sm font-bold text-xs flex justify-between items-center transition-colors" style={{ backgroundColor: borderColor, color: 'var(--text-bg)' }}>
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
