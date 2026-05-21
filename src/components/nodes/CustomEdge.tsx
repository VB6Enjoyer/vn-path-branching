import React from 'react';
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

  const onEdgeClick = () => {
    setEdges((edges) => edges.filter((edge) => edge.id !== id));
  };

  const isHighlighted = !!data?.isHighlighted;
  const isBlurred = !!data?.isBlurred;

  const edgeStyle = isHighlighted
    ? { ...style, stroke: 'var(--path-highlight-color)', strokeWidth: 4, filter: 'drop-shadow(0 0 4px var(--path-highlight-color))' }
    : style;

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={edgeStyle} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            fontSize: 12,
            pointerEvents: isBlurred ? 'none' : 'all',
            backgroundColor: 'var(--text-bg)',
            color: 'var(--text-color)',
            borderColor: isHighlighted ? 'var(--path-highlight-color)' : 'var(--text-color)',
            boxShadow: isHighlighted ? '0 0 8px var(--path-highlight-color)' : undefined
          }}
          className={`nodrag nopan flex items-center gap-1 border px-2 py-1 rounded shadow-sm opacity-90 transition-all ${isBlurred ? 'blur-[8px]' : ''}`}
        >
          {label && <span className="font-semibold">{label}</span>}
          {!isBlurred && (
            <button
              className="text-red-400 hover:text-red-600 transition-colors ml-1"
              onClick={onEdgeClick}
              title="Delete Connection"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
