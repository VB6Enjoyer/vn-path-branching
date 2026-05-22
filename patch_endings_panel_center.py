import re

with open('src/components/Editor.tsx', 'r') as f:
    content = f.read()

# Make sure fitView and setCenter are extracted from useReactFlow
if "setCenter" not in content:
    content = content.replace("const { setNodes, setEdges } = useReactFlow();", "const { setNodes, setEdges, setCenter } = useReactFlow();")

center_injection = """onClick={() => {
                               if (node.position) {
                                 setCenter(node.position.x + 100, node.position.y + 100, { zoom: 1, duration: 800 });
                               }
                            }}"""

content = re.sub(r'onClick=\{\(\) => \{\n\s+// Quick and dirty pan to node\n\s+const el = document.querySelector.+?;\n\s+if \(el\) \{\n\s+el\.scrollIntoView.+?;\n\s+\}\n\s+\}\}', center_injection, content, flags=re.DOTALL)

with open('src/components/Editor.tsx', 'w') as f:
    f.write(content)
