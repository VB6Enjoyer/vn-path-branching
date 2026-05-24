import re

with open('src/components/Editor.tsx', 'r') as f:
    content = f.read()

# Inject into nodesWithCallbacks
content = content.replace("const data: Record<string, unknown> = { ...node.data, onDelete: deleteNode, isHighlighted, isBlurred };",
                          "const data: Record<string, unknown> = { ...node.data, onDelete: deleteNode, isHighlighted, isBlurred, isLocked };")
content = content.replace("}, [nodes, updateNodeData, deleteNode, setEdges, highlightedNodeIds, isSpoilerMode, revealedNodeIds]);",
                          "}, [nodes, updateNodeData, deleteNode, setEdges, highlightedNodeIds, isSpoilerMode, revealedNodeIds, isLocked]);")

# Inject into edgesWithCallbacks
content = content.replace("isHighlighted: highlightedEdgeIds.has(edge.id),",
                          "isHighlighted: highlightedEdgeIds.has(edge.id),\n          isLocked,")
content = content.replace("}, [edges, handleDeleteEdge, highlightedEdgeIds, isSpoilerMode, revealedNodeIds]);",
                          "}, [edges, handleDeleteEdge, highlightedEdgeIds, isSpoilerMode, revealedNodeIds, isLocked]);")

with open('src/components/Editor.tsx', 'w') as f:
    f.write(content)
