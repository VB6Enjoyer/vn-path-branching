import re

with open('src/components/Editor.tsx', 'r') as f:
    content = f.read()

content = content.replace("const { fitView, screenToFlowPosition } = useReactFlow();", "const { fitView, screenToFlowPosition, setCenter } = useReactFlow();")

with open('src/components/Editor.tsx', 'w') as f:
    f.write(content)
