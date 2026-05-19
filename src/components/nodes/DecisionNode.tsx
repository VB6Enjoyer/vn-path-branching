import React, { useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Plus, X, Trash2, Eye, EyeOff } from 'lucide-react';

export function DecisionNode({ data, id }: NodeProps) {
  const [choices, setChoices] = useState<string[]>((data.choices as string[]) || ['Choice 1', 'Choice 2']);
  const [prompt, setPrompt] = useState<string>((data.prompt as string) || 'Decision');
  const [isTextHidden, setIsTextHidden] = useState<boolean>((data.isTextHidden as boolean) || false);

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

  const toggleTextHidden = () => {
    const newState = !isTextHidden;
    setIsTextHidden(newState);
    if (typeof data.onTextHiddenChange === 'function') {
      data.onTextHiddenChange(id, newState);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    if (e.shiftKey || window.confirm('Are you sure you want to delete this decision node?')) {
      if (typeof data.onDelete === 'function') {
        data.onDelete(id);
      }
    }
  };

  // Calculate widths for balanced handles based on number of choices
  const getHandlePosition = (index: number, total: number) => {
    if (total === 1) return '50%';
    const step = 100 / (total - 1);
    return `${index * step}%`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 border-2 border-blue-500 rounded-lg shadow-lg w-64 group">
      <Handle type="target" position={Position.Top} className="w-5 h-5 bg-blue-500" />

      <div className="bg-blue-500 text-white p-2 rounded-t-sm font-bold text-sm flex justify-between items-center">
        <span>Decision</span>
        <div className="flex gap-1">
          <button
            onClick={toggleTextHidden}
            className="text-blue-100 hover:text-white hover:bg-blue-600 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
            title="Toggle Text Box"
          >
            {isTextHidden ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
          <button
            onClick={handleDelete}
            className="text-blue-100 hover:text-white hover:bg-blue-600 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
            title="Delete Node (Shift+Click to bypass confirm)"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="p-3">
        {!isTextHidden && (
          <textarea
            className="w-full text-sm p-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded mb-3 resize-none nodrag text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
            rows={2}
            value={prompt}
            onChange={(e) => updatePrompt(e.target.value)}
            placeholder="What happens next?"
          />
        )}

        <div className="space-y-2 mb-3">
          <div className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Choices</div>
          {choices.map((choice, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                className="flex-1 text-sm p-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded nodrag text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                value={choice}
                onChange={(e) => updateChoice(index, e.target.value)}
              />
              <button
                onClick={() => removeChoice(index)}
                className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 p-1 rounded transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={addChoice}
          className="w-full py-1 text-sm text-blue-700 dark:text-blue-400 border border-blue-300 dark:border-blue-600 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 flex items-center justify-center gap-1 transition-colors"
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
          className="w-5 h-5 bg-blue-500"
        />
      ))}
    </div>
  );
}
