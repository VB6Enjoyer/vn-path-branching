import React, { useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';

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

  const colors = {
    good: 'border-green-500 bg-green-50',
    bad: 'border-red-500 bg-red-50',
    neutral: 'border-purple-500 bg-purple-50',
  };

  const headerColors = {
    good: 'bg-green-500 text-white',
    bad: 'bg-red-500 text-white',
    neutral: 'bg-purple-500 text-white',
  };

  return (
    <div className={`border-2 rounded-lg shadow-lg w-48 ${colors[type as keyof typeof colors]}`}>
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-gray-800" />

      <div className={`p-1.5 rounded-t-sm font-bold text-xs flex justify-between items-center ${headerColors[type as keyof typeof headerColors]}`}>
        <span>Outcome / Ending</span>
      </div>

      <div className="p-3">
        <input
          className="w-full text-center font-bold text-sm p-1 border-b border-gray-300 bg-transparent mb-2 nodrag"
          value={outcome}
          onChange={(e) => updateOutcome(e.target.value)}
          placeholder="Ending Name"
        />

        <select
          className="w-full text-xs p-1 border border-gray-200 rounded nodrag"
          value={type}
          onChange={(e) => updateType(e.target.value)}
        >
          <option value="good">Good Ending</option>
          <option value="neutral">Neutral Ending</option>
          <option value="bad">Bad Ending</option>
        </select>
      </div>
      {/* Intentionally no bottom handle, it's an ending! */}
    </div>
  );
}
