import re

with open('src/components/Editor.tsx', 'r') as f:
    content = f.read()

# I patched the wrong addNode signature before or didn't get all of them. Let's fix the type definition.
add_node_signature = """  const addNode = useCallback(
    (type: 'decision' | 'text' | 'outcome' | 'image', x: number, y: number, connectionParams?: { source: string; sourceHandle?: string }) => {"""

content = re.sub(r'  const addNode = useCallback\(\n    \(type: \'decision\' \| \'text\' \| \'outcome\', x: number, y: number, connectionParams\?: \{ source: string; sourceHandle\?: string \}\) => \{', add_node_signature, content)

with open('src/components/Editor.tsx', 'w') as f:
    f.write(content)
