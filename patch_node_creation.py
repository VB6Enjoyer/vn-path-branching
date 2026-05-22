import re

with open('src/components/Editor.tsx', 'r') as f:
    content = f.read()

# Fix handleAddNode context menu handler
content = content.replace("data: { label: 'New Outcome', outcomeType: outcomeType || 'neutral' },", "data: { outcome: '', type: outcomeType || 'neutral' },")

# Fix addNode toolbar handler
content = content.replace("data: { label: 'New Outcome', outcomeType: 'neutral' },", "data: { outcome: '', type: 'neutral' },")

with open('src/components/Editor.tsx', 'w') as f:
    f.write(content)
