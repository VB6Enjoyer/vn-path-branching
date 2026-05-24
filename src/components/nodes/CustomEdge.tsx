import React, { useState } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath,
  useReactFlow,
} from '@xyflow/react';
import { X } from 'lucide-react';

export function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  markerEnd,
  label,
  data
}: EdgeProps) {
  const { setEdges } = useReactFlow();
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const [isHovered, setIsHovered] = useState(false);

  const onEdgeClick = () => {
    setEdges((edges) => edges.filter((edge) => edge.id !== id));
  };

  const isHighlighted = !!data?.isHighlighted;
  const isBlurred = !!data?.isBlurred;
  const isLocked = !!data?.isLocked;

  const edgeStyle = isHighlighted
    ? { ...style, stroke: 'var(--path-highlight-color)', strokeWidth: 4, filter: 'drop-shadow(0 0 4px var(--path-highlight-color))' }
    : { ...style, stroke: 'var(--path-color)' };

  return (
    <>
      <g
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <path
          d={edgePath}
          fill="none"
          strokeOpacity={0}
          strokeWidth={20}
          pointerEvents="stroke"
        />
        <BaseEdge path={edgePath} markerEnd={markerEnd} style={edgeStyle} />
      </g>
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: isBlurred ? 'none' : 'all',
          }}
          className="nodrag nopan flex items-center justify-center"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {label ? (
            <div
              style={{
                fontSize: 12,
                backgroundColor: 'var(--text-bg)',
                color: 'var(--text-color)',
                borderColor: isHighlighted ? 'var(--path-highlight-color)' : 'var(--text-color)',
                boxShadow: isHighlighted ? '0 0 8px var(--path-highlight-color)' : undefined
              }}
              className={`flex items-center gap-1 border px-2 py-1 rounded shadow-sm transition-all ${isBlurred ? 'blur-[8px] opacity-90' : 'opacity-90'}`}
            >
              <span className="font-semibold">{label}</span>
              {!isBlurred && !isLocked && isHovered && (
                <button
                  className="text-red-400 hover:text-red-600 transition-colors ml-1"
                  onClick={onEdgeClick}
                  title="Delete Connection"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          ) : (
            <>
              {!isBlurred && !isLocked && isHovered && (
                <button
                  style={{
                    backgroundColor: 'var(--node-bg)',
                    borderColor: 'var(--text-color)',
                  }}
                  className="flex items-center justify-center border w-6 h-6 rounded-full shadow-sm text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  onClick={onEdgeClick}
                  title="Delete Connection"
                >
                  <X size={14} />
                </button>
              )}
            </>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
