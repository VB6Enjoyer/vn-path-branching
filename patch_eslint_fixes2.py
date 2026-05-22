import re

# Fix Editor.tsx (unused import ImageIcon)
with open('src/components/Editor.tsx', 'r') as f:
    editor_content = f.read()

# We need to make sure the actual context menu in the rendered HTML uses it, let's verify if the patch worked
if "<ImageIcon" in editor_content:
    print("ImageIcon is used in the JSX")
else:
    print("ImageIcon is not in the JSX, need to patch it properly")
