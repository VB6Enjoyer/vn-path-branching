import React, { useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Trash2 } from 'lucide-react';

export function OutcomeNode({ data, id }: NodeProps) {
  const [outcome, setOutcome] = useState<string>((data.outcome as string) || 'Ending Name');
  const [type, setType] = useState<string>((data.type as string) || 'neutral');

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

  const colors = {
    good: 'border-green-500 bg-green-50 dark:bg-green-900/20 dark:border-green-600',
    bad: 'border-red-500 bg-red-50 dark:bg-red-900/20 dark:border-red-600',
    neutral: 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-600',
  };

  const headerColors = {
    good: 'bg-green-500 dark:bg-green-600 text-white',
    bad: 'bg-red-500 dark:bg-red-600 text-white',
    neutral: 'bg-purple-500 dark:bg-purple-600 text-white',
  };

  return (
    <div className={`border-2 rounded-lg shadow-lg w-48 group ${colors[type as keyof typeof colors]}`}>
      <Handle type="target" position={Position.Top} className="w-5 h-5 bg-gray-800 dark:bg-gray-400" />

      <div className={`p-1.5 rounded-t-sm font-bold text-xs flex justify-between items-center ${headerColors[type as keyof typeof headerColors]}`}>
        <span>Outcome / Ending</span>
        <button
          onClick={handleDelete}
          className="text-white/80 hover:text-white hover:bg-black/20 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
          title="Delete Node (Shift+Click to bypass confirm)"
        >
          <Trash2 size={12} />
        </button>
      </div>

      <div className="p-3">
        <input
          className="w-full text-center font-bold text-sm p-1 border-b border-gray-400 dark:border-gray-500 bg-transparent mb-2 nodrag text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:border-gray-600 dark:focus:border-gray-300"
          value={outcome}
          onChange={(e) => updateOutcome(e.target.value)}
          placeholder="Ending Name"
        />

        <select
          className="w-full text-xs p-1 border border-gray-300 dark:border-gray-600 rounded nodrag bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
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
