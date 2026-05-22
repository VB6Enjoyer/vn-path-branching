import re

with open('src/components/nodes/CustomEdge.tsx', 'r') as f:
    content = f.read()

new_content = content.replace("import React from 'react';", "import React, { useState } from 'react';")

replacement = """  const [isHovered, setIsHovered] = useState(false);

  const onEdgeClick = () => {
    setEdges((edges) => edges.filter((edge) => edge.id !== id));
  };"""

new_content = re.sub(r'  const onEdgeClick = \(\) => \{[^\}]+\};', replacement, new_content)

return_replacement = """  return (
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
              {!isBlurred && isHovered && (
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
              {!isBlurred && isHovered && (
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
  );"""

# Replace the return block
new_content = re.sub(r'  return \([\s\S]+?\);\n\}', return_replacement + '\n}', new_content)

with open('src/components/nodes/CustomEdge.tsx', 'w') as f:
    f.write(new_content)
