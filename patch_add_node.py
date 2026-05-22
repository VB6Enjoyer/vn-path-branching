import re

with open('src/components/Editor.tsx', 'r') as f:
    content = f.read()

replacement = """  const addNode = useCallback(
    (type: 'decision' | 'text' | 'outcome' | 'image', x: number, y: number, connectionParams?: { source: string; sourceHandle?: string }) => {
      saveHistory(nodes, edges);

      const newNodeId = uuidv4();
      let newNode: Node;

      if (type === 'decision') {
        newNode = {
          id: newNodeId,
          type: 'decision',
          position: { x, y },
          data: { prompt: 'New Decision', choices: ['Choice 1'] },
        };
      } else if (type === 'text') {
        newNode = {
          id: newNodeId,
          type: 'text',
          position: { x, y },
          data: { content: 'New context or info...' },
        };
      } else if (type === 'image') {
        newNode = {
          id: newNodeId,
          type: 'image',
          position: { x, y },
          data: { mediaUrl: '' },
        };
      } else {
        newNode = {
          id: newNodeId,
          type: 'outcome',
          position: { x, y },
          data: { label: 'New Outcome', outcomeType: 'neutral' },
        };
      }"""

content = re.sub(r'  const addNode = useCallback\(\n    \(type: \'decision\' \| \'text\' \| \'outcome\', x: number, y: number, connectionParams\?: \{ source: string; sourceHandle\?: string \}\) => \{[\s\S]+?      \} else \{[\s\S]+?      \}', replacement, content)

with open('src/components/Editor.tsx', 'w') as f:
    f.write(content)
