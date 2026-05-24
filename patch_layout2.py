import re

with open('src/utils/layout.ts', 'r') as f:
    content = f.read()

replacement = r"""  const sortedEdges = [...edges].sort((a, b) => {
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
  sortedEdges.forEach((edge, index) => {
    // We pass weight: 1, but by adding them in order, dagre usually respects the initial insertion
    // order for siblings.
    dagreGraph.setEdge(edge.source, edge.target, { weight: 1 });
  });"""

content = re.sub(r'  const sortedEdges = \[\.\.\.edges\]\.sort\(\(a, b\) => \{[\s\S]+?dagreGraph\.setEdge\(edge\.source, edge\.target\);\n  \}\);', replacement, content)

with open('src/utils/layout.ts', 'w') as f:
    f.write(content)
