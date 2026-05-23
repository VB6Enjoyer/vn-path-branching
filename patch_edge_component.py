import re

with open('src/components/nodes/CustomEdge.tsx', 'r') as f:
    content = f.read()

edge_style_replacement = """  const isHighlighted = !!data?.isHighlighted;
  const isBlurred = !!data?.isBlurred;

  const edgeStyle = isHighlighted
    ? { ...style, stroke: 'var(--path-highlight-color)', strokeWidth: 4, filter: 'drop-shadow(0 0 4px var(--path-highlight-color))' }
    : { ...style, stroke: 'var(--path-color)' };"""

content = re.sub(r'  const isHighlighted = !!data\?\.isHighlighted;\n  const isBlurred = !!data\?\.isBlurred;\n\n  const edgeStyle = isHighlighted \n    \? \{ \.\.\.style, stroke: \'var\(--path-highlight-color\)\', strokeWidth: 4, filter: \'drop-shadow\(0 0 4px var\(--path-highlight-color\)\)\' \}\n    : style;', edge_style_replacement, content)

with open('src/components/nodes/CustomEdge.tsx', 'w') as f:
    f.write(content)
