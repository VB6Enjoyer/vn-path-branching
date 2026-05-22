import re

with open('src/components/Editor.tsx', 'r') as f:
    content = f.read()

# Add Decoration to create menu
menu_replacement = """                <button className="flex justify-between items-center px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200" onClick={() => handleAddNode('outcome', 'neutral')}>
                  Add Outcome
                </button>
                <div className="h-px bg-gray-200 dark:bg-gray-700 my-1 mx-2"></div>
                <button className="flex items-center gap-2 px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200" onClick={() => handleAddNode('image')}>
                  <ImageIcon size={14} className="text-gray-400" /> Add Decoration
                </button>"""

content = content.replace("""                <button className="flex justify-between items-center px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200" onClick={() => handleAddNode('outcome', 'neutral')}>
                  Add Outcome
                </button>""", menu_replacement)

# Update handleAddNode signature and body
add_node_replacement = """  const handleAddNode = (type: 'decision' | 'text' | 'outcome' | 'image', outcomeType?: 'good' | 'bad' | 'neutral') => {
    saveHistory(nodes, edges);

    const newNodeId = uuidv4();
    const position = { x: menu.x, y: menu.y };

    let newNode: Node;

    if (type === 'decision') {
      newNode = {
        id: newNodeId,
        type: 'decision',
        position,
        data: { prompt: 'New Decision', choices: ['Choice 1'] },
      };
    } else if (type === 'text') {
      newNode = {
        id: newNodeId,
        type: 'text',
        position,
        data: { content: 'New context or info...' },
      };
    } else if (type === 'image') {
      newNode = {
        id: newNodeId,
        type: 'image',
        position,
        data: { mediaUrl: '' },
      };
    } else {
      newNode = {
        id: newNodeId,
        type: 'outcome',
        position,
        data: { label: 'New Outcome', outcomeType: outcomeType || 'neutral' },
      };
    }"""

content = re.sub(r'  const handleAddNode = \(type: \'decision\' \| \'text\' \| \'outcome\', outcomeType\?: \'good\' \| \'bad\' \| \'neutral\'\) => \{[\s\S]+?    \} else \{[\s\S]+?    \}', add_node_replacement, content)

with open('src/components/Editor.tsx', 'w') as f:
    f.write(content)
