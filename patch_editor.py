import re

with open('src/components/Editor.tsx', 'r') as f:
    content = f.read()

# 1. Import DecorativeNode
content = content.replace("import { DecisionNode, TextNode, OutcomeNode, CustomEdge } from './nodes';",
                          "import { DecisionNode, TextNode, OutcomeNode, CustomEdge, DecorativeNode } from './nodes';")

# 2. Add 'image' to nodeTypes
content = content.replace("  outcome: OutcomeNode,",
                          "  outcome: OutcomeNode,\n  image: DecorativeNode,")

# 3. Update Context Menu
context_menu_replacement = """          <button
            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            onClick={() => handleContextMenuAdd('outcome', 'neutral')}
          >
            Add Outcome
          </button>
          <div className="h-px bg-gray-200 dark:bg-gray-700 my-1"></div>
          <button
            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors"
            onClick={() => handleContextMenuAdd('image')}
          >
            <ImageIcon size={14} className="text-gray-400" /> Add Decoration
          </button>"""

content = content.replace("""          <button
            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            onClick={() => handleContextMenuAdd('outcome', 'neutral')}
          >
            Add Outcome
          </button>""", context_menu_replacement)

# Ensure ImageIcon is imported
if "ImageIcon" not in content and "Image as ImageIcon" not in content:
    content = content.replace("Trash2, Waypoints, EyeClosed } from 'lucide-react';",
                              "Trash2, Waypoints, EyeClosed, Image as ImageIcon } from 'lucide-react';")

# 4. HandleContextMenuAdd modification
handle_add_replacement = """  const handleContextMenuAdd = useCallback((type: 'decision' | 'text' | 'outcome' | 'image', outcomeType?: 'good' | 'bad' | 'neutral') => {
    if (!contextMenu) return;

    saveHistory(nodes, edges);

    const newNodeId = uuidv4();
    const position = { x: contextMenu.x, y: contextMenu.y };

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

content = re.sub(r'  const handleContextMenuAdd = useCallback\(\(type: \'decision\' \| \'text\' \| \'outcome\', outcomeType\?: \'good\' \| \'bad\' \| \'neutral\'\) => \{[\s\S]+?    \} else \{[\s\S]+?    \}', handle_add_replacement, content)

with open('src/components/Editor.tsx', 'w') as f:
    f.write(content)
