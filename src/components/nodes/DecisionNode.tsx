import React, { useState, useMemo } from 'react';
import { Handle, Position, NodeProps, useConnection } from '@xyflow/react';
import { Plus, X, Trash2, Eye, EyeOff } from 'lucide-react';

export function DecisionNode({ data, id }: NodeProps) {
  const [choices, setChoices] = useState<string[]>((data.choices as string[]) || ['Choice 1', 'Choice 2']);
  const [prompt, setPrompt] = useState<string>((data.prompt as string) || 'Decision');
  const [isTextHidden, setIsTextHidden] = useState<boolean>((data.isTextHidden as boolean) || false);

  // Track hover state for handles
  const [hoveredHandleIndex, setHoveredHandleIndex] = useState<number | null>(null);

  // Track active connection
  const connection = useConnection();

  // If we are currently making a connection FROM this node, identify which handle is being dragged
  const activeDragIndex = useMemo(() => {
    if (connection.inProgress && connection.fromNode?.id === id && connection.fromHandle?.id) {
       const indexStr = connection.fromHandle.id.replace('choice-', '');
       const index = parseInt(indexStr, 10);
       if (!isNaN(index)) return index;
    }
    return null;
  }, [connection, id]);

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

  const getHandlePosition = (index: number, total: number) => {
    if (total === 1) return '50%';
    const step = 100 / (total - 1);
    return `${index * step}%`;
  };

  return (
    <div className="border-2 rounded-lg shadow-lg w-64 group" style={{ borderColor: 'var(--decision-color)', backgroundColor: 'var(--text-bg)' }}>
      <Handle type="target" position={Position.Top} className="w-5 h-5 border-2 border-gray-900 dark:border-gray-100" style={{ backgroundColor: 'var(--decision-color)' }} />

      <div className="p-2 rounded-t-sm font-bold text-sm flex justify-between items-center" style={{ backgroundColor: 'var(--decision-color)', color: 'var(--text-bg)' }}>
        <span>Decision</span>
        <div className="flex gap-1">
          <button
            onClick={toggleTextHidden}
            className="hover:opacity-80 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
            title="Toggle Text Box"
          >
            {isTextHidden ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
          <button
            onClick={handleDelete}
            className="hover:text-red-300 hover:opacity-80 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
            title="Delete Node (Shift+Click to bypass confirm)"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="p-3">
        {!isTextHidden && (
          <textarea
            className="w-full text-sm p-2 border rounded mb-3 resize-none nodrag focus:outline-none"
            style={{ backgroundColor: 'var(--text-bg)', color: 'var(--text-color)', borderColor: 'var(--decision-color)' }}
            rows={2}
            value={prompt}
            onChange={(e) => updatePrompt(e.target.value)}
            placeholder="What happens next?"
          />
        )}

        <div className="space-y-2 mb-3">
          <div className="text-xs font-semibold uppercase" style={{ color: 'var(--decision-color)', opacity: 0.8 }}>Choices</div>
          {choices.map((choice, index) => {
            const isHighlighted = hoveredHandleIndex === index || activeDragIndex === index;
            return (
              <div key={index} className="flex items-center gap-2">
                <input
                  className={`flex-1 text-sm p-1 border rounded nodrag focus:outline-none transition-shadow ${isHighlighted ? 'ring-2 ring-offset-1 ring-blue-400 dark:ring-blue-500' : ''}`}
                  style={{ backgroundColor: 'var(--text-bg)', color: 'var(--text-color)', borderColor: 'var(--decision-color)' }}
                  value={choice}
                  onChange={(e) => updateChoice(index, e.target.value)}
                />
                <button
                  onClick={() => removeChoice(index)}
                  className="text-red-500 hover:bg-red-100 p-1 rounded transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            );
          })}
        </div>

        <button
          onClick={addChoice}
          className="w-full py-1 text-sm border rounded flex items-center justify-center gap-1 transition-colors hover:opacity-80"
          style={{ borderColor: 'var(--decision-color)', color: 'var(--decision-color)' }}
        >
          <Plus size={14} /> Add Choice
        </button>
      </div>

      {choices.map((_, index) => (
        <div
           key={`handle-wrapper-${index}`}
           onMouseEnter={() => setHoveredHandleIndex(index)}
           onMouseLeave={() => setHoveredHandleIndex(null)}
        >
          <Handle
            type="source"
            position={Position.Bottom}
            id={`choice-${index}`}
            style={{ left: getHandlePosition(index, choices.length), backgroundColor: 'var(--decision-color)' }}
            className="w-5 h-5 border-2 border-gray-900 dark:border-gray-100 hover:scale-110 transition-transform"
          />
        </div>
      ))}
    </div>
  );
}
