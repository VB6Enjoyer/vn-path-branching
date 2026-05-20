import dagre from 'dagre';
import { Node, Edge, Position } from '@xyflow/react';

export const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  const isHorizontal = direction === 'LR';
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  dagreGraph.setGraph({ rankdir: direction, ranksep: 120, nodesep: 80 });

  nodes.forEach((node) => {
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

  const newNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const newNode = {
      ...node,
      targetPosition: isHorizontal ? Position.Left : Position.Top,
      sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
      position: {
        x: nodeWithPosition.x - nodeWithPosition.width / 2,
        y: nodeWithPosition.y - nodeWithPosition.height / 2,
      },
    };

    return newNode;
  });

  return { nodes: newNodes, edges };
};
