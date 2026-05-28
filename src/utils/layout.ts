import dagre from 'dagre';
import { Node, Edge, Position } from '@xyflow/react';

export const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
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
    // 1. Group edges by source node
    if (a.source === b.source) {
      // 2. If they have different source handles (e.g. choice-0 vs choice-1),
      // order them based on the numerical index of the choice.
      const getHandleIndex = (handle: string | null | undefined) => {
        if (!handle) return 0;
        const match = handle.match(/\d+/);
        return match ? parseInt(match[0], 10) : 0;
      };

      const indexA = getHandleIndex(a.sourceHandle);
      const indexB = getHandleIndex(b.sourceHandle);

      if (indexA !== indexB) {
        return indexA - indexB;
      }

      // 3. If they share the same source handle (e.g. an event node splitting into two paths),
      // order them deterministically to avoid random crossings.
      return a.target.localeCompare(b.target);
    }

    // Group edges by their source ID string
    return a.source.localeCompare(b.source);
  });

  // Assign edge weights. Stronger weights force dagre to keep nodes closer and aligned.
  sortedEdges.forEach((edge) => {
    // We pass weight: 1, but by adding them in order, dagre usually respects the initial insertion
    // order for siblings.
    dagreGraph.setEdge(edge.source, edge.target, { weight: 1 });
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
};
