with open('src/utils/layout.ts', 'r') as f:
    content = f.read()

# Filter out image nodes from layout algorithm entirely
# We only pass non-image nodes to dagre
replacement = """export const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  const isHorizontal = direction === 'LR';
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  dagreGraph.setGraph({ rankdir: direction, ranksep: 120, nodesep: 80 });

  // Separate layout nodes and ignored nodes
  const layoutNodes = nodes.filter(n => n.type !== 'image');
  const ignoredNodes = nodes.filter(n => n.type === 'image');

  layoutNodes.forEach((node) => {
    // If the node has been measured (rendered or resized), use its actual dimensions.
    // Otherwise, fallback to initial default assumptions based on type.
    const width = node.measured?.width || (node.type === 'decision' ? 260 : 200);
    const height = node.measured?.height || (node.type === 'decision' ? 200 : 150);
    dagreGraph.setNode(node.id, { width, height });
  });

  // To prevent crossed lines from the same parent, we need to sort the edges
  // based on the sourceHandle index before passing them to dagre.
  // Dagre respects the order in which edges are added.
  const sortedEdges = [...edges].sort((a, b) => {
    if (a.source === b.source && a.sourceHandle && b.sourceHandle) {
       const indexA = parseInt(a.sourceHandle.replace('choice-', ''), 10);
       const indexB = parseInt(b.sourceHandle.replace('choice-', ''), 10);
       if (!isNaN(indexA) && !isNaN(indexB)) {
         return indexA - indexB;
       }
    }
    return 0;
  });

  sortedEdges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const newLayoutNodes = layoutNodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      targetPosition: isHorizontal ? Position.Left : Position.Top,
      sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
      position: {
        x: nodeWithPosition.x - nodeWithPosition.width / 2,
        y: nodeWithPosition.y - nodeWithPosition.height / 2,
      },
    };
  });

  // Combine laid out nodes with ignored nodes (keeping their original positions)
  const newNodes = [...newLayoutNodes, ...ignoredNodes];

  return { nodes: newNodes, edges };
};"""

import re
content = re.sub(r'export const getLayoutedElements = \([\s\S]+?\};\n\};', replacement, content)

with open('src/utils/layout.ts', 'w') as f:
    f.write(content)
