import re

with open('src/components/Editor.tsx', 'r') as f:
    content = f.read()

# Fix the correct addNode function signature
content = content.replace("  const addNode = (type: 'decision' | 'text' | 'outcome', menuX?: number, menuY?: number, connectionParams?: {source: string, sourceHandle?: string}) => {",
                          "  const addNode = (type: 'decision' | 'text' | 'outcome' | 'image', menuX?: number, menuY?: number, connectionParams?: {source: string, sourceHandle?: string}) => {")

with open('src/components/Editor.tsx', 'w') as f:
    f.write(content)
