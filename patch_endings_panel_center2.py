import re

with open('src/components/Editor.tsx', 'r') as f:
    content = f.read()

# Make sure setCenter is imported from useReactFlow if not already
if "const { setNodes, setEdges, setCenter } = useReactFlow();" not in content:
    content = content.replace("const { setNodes, setEdges } = useReactFlow();", "const { setNodes, setEdges, setCenter } = useReactFlow();")

with open('src/components/Editor.tsx', 'w') as f:
    f.write(content)
