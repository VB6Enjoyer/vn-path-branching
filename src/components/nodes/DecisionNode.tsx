import React, { useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Plus, X } from 'lucide-react';

export function DecisionNode({ data, id }: NodeProps) {
  const [choices, setChoices] = useState<string[]>((data.choices as string[]) || ['Choice 1', 'Choice 2']);
  const [prompt, setPrompt] = useState<string>((data.prompt as string) || 'Decision');

  const addChoice = () => {
    const newChoices = [...choices, `Choice ${choices.length + 1}`];
    setChoices(newChoices);
    if (typeof data.onChoicesChange === 'function') {
      data.onChoicesChange(id, newChoices);
    }
  };

  const removeChoice = (index: number) => {
    if (choices.length <= 1) return;
    const newChoices = choices.filter((_, i) => i !== index);
    setChoices(newChoices);
    if (typeof data.onChoicesChange === 'function') {
      data.onChoicesChange(id, newChoices);
    }
  };

  const updateChoice = (index: number, value: string) => {
    const newChoices = [...choices];
    newChoices[index] = value;
    setChoices(newChoices);
    if (typeof data.onChoicesChange === 'function') {
      data.onChoicesChange(id, newChoices);
    }
  };

  const updatePrompt = (value: string) => {
    setPrompt(value);
    if (typeof data.onPromptChange === 'function') {
      data.onPromptChange(id, value);
    }
  };

  // Calculate widths for balanced handles based on number of choices
  const getHandlePosition = (index: number, total: number) => {
    if (total === 1) return '50%';
    const step = 100 / (total - 1);
    return `${index * step}%`;
  };

  return (
    <div className="bg-white border-2 border-blue-500 rounded-lg shadow-lg w-64">
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-blue-500" />

      <div className="bg-blue-500 text-white p-2 rounded-t-sm font-bold text-sm flex justify-between items-center">
        <span>Decision</span>
      </div>

      <div className="p-3">
        <textarea
          className="w-full text-sm p-2 border border-gray-200 rounded mb-3 resize-none nodrag"
          rows={2}
          value={prompt}
          onChange={(e) => updatePrompt(e.target.value)}
          placeholder="What happens next?"
        />

        <div className="space-y-2 mb-3">
          <div className="text-xs font-semibold text-gray-500 uppercase">Choices</div>
          {choices.map((choice, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                className="flex-1 text-sm p-1 border border-gray-200 rounded nodrag"
                value={choice}
                onChange={(e) => updateChoice(index, e.target.value)}
              />
              <button
                onClick={() => removeChoice(index)}
                className="text-red-500 hover:bg-red-50 p-1 rounded transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={addChoice}
          className="w-full py-1 text-sm text-blue-600 border border-blue-200 rounded hover:bg-blue-50 flex items-center justify-center gap-1 transition-colors"
        >
          <Plus size={14} /> Add Choice
        </button>
      </div>

      {/* Dynamic handles for each choice */}
      {choices.map((_, index) => (
        <Handle
          key={`choice-${index}`}
          type="source"
          position={Position.Bottom}
          id={`choice-${index}`}
          style={{ left: getHandlePosition(index, choices.length) }}
          className="w-3 h-3 bg-blue-500"
        />
      ))}
    </div>
  );
}
