with open('src/utils/layout.ts', 'r') as f:
    content = f.read()

content = content.replace("sortedEdges.forEach((edge, index) => {", "sortedEdges.forEach((edge) => {")

with open('src/utils/layout.ts', 'w') as f:
    f.write(content)
