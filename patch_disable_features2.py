import re

with open('src/components/Editor.tsx', 'r') as f:
    content = f.read()

# Make sure disabled is applied to Undo, Redo, Layout, New Flow, Add Nodes.

# Fix Undo/Redo buttons
content = content.replace('disabled={past.length === 0}', 'disabled={isLocked || past.length === 0}')
content = content.replace('disabled={future.length === 0}', 'disabled={isLocked || future.length === 0}')

# Fix Import button specifically
content = content.replace('<button onClick={() => fileInputRef.current?.click()}', '<button onClick={() => !isLocked && fileInputRef.current?.click()} disabled={isLocked}')

# Auto Layout button
content = content.replace('onClick={onLayout}', 'onClick={onLayout} disabled={isLocked}')

# New Flow button
content = content.replace('onClick={startFromScratch}', 'onClick={startFromScratch} disabled={isLocked}')

with open('src/components/Editor.tsx', 'w') as f:
    f.write(content)
