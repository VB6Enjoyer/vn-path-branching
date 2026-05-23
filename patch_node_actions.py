import re

def patch_file(filepath, replacements):
    with open(filepath, 'r') as f:
        content = f.read()
    for old, new in replacements:
        content = content.replace(old, new)
    with open(filepath, 'w') as f:
        f.write(content)

# DecisionNode.tsx
patch_file('src/components/nodes/DecisionNode.tsx', [
    # Hide Remove Choice (my previous regex missed it because I didn't include the class name right)
    ('className="text-red-500 hover:bg-red-100 p-1 rounded transition-colors"',
     'disabled={isLocked}\n                  className={`text-red-500 hover:bg-red-100 p-1 rounded transition-colors ${isLocked ? \'hidden\' : \'\'}`}'),
    # Hide Toggle Text Box
    ('className="hover:opacity-80 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"\n            title="Toggle Text Box"',
     'disabled={isLocked}\n            className={`hover:opacity-80 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity ${isLocked ? \'hidden\' : \'\'}`}\n            title="Toggle Text Box"'),
])

# TextNode.tsx
patch_file('src/components/nodes/TextNode.tsx', [
    # Hide Toggle Text Box
    ('className="hover:opacity-80 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"\n            title="Toggle Text Box"',
     'disabled={isLocked}\n            className={`hover:opacity-80 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity ${isLocked ? \'hidden\' : \'\'}`}\n            title="Toggle Text Box"'),
    # Hide Add Image button
    ('className="w-full py-1 text-sm border rounded flex items-center justify-center gap-1 transition-colors hover:opacity-80"',
     'disabled={isLocked}\n              className={`w-full py-1 text-sm border rounded flex items-center justify-center gap-1 transition-colors hover:opacity-80 ${isLocked ? \'hidden\' : \'\'}`}'),
    # Hide Remove Image button
    ('className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity"',
     'disabled={isLocked}\n              className={`absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity ${isLocked ? \'hidden\' : \'\'}`}'),
])
