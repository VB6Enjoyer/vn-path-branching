import re

with open('src/components/Editor.tsx', 'r') as f:
    content = f.read()

content = content.replace("const isBlurred = isSpoilerMode && node.id !== 'start' && !revealedNodeIds.has(node.id);",
                          "const isBlurred = isSpoilerMode && node.id !== 'start' && node.type !== 'image' && !revealedNodeIds.has(node.id);")

with open('src/components/Editor.tsx', 'w') as f:
    f.write(content)
