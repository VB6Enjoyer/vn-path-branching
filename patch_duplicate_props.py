import re

def patch_file(filepath, replacements):
    with open(filepath, 'r') as f:
        content = f.read()
    for old, new in replacements:
        content = content.replace(old, new)
    with open(filepath, 'w') as f:
        f.write(content)

# DecisionNode has duplicate classNames
patch_file('src/components/nodes/DecisionNode.tsx', [
    ('            title="Delete Node (Shift+Click to bypass confirm)"\n          >\n            <Trash2 size={14} />\n          </button>',
     '            title="Delete Node (Shift+Click to bypass confirm)"\n          >\n            <Trash2 size={14} />\n          </button>'),
    ('className={`text-red-400 hover:text-red-600 transition-colors ml-1 ${isLocked ? \'hidden\' : \'\'}`}\n              \n              title="Remove choice"',
     'className={`text-red-400 hover:text-red-600 transition-colors ml-1 ${isLocked ? \'hidden\' : \'\'}`}\n              title="Remove choice"'),
])

# Wait, let's just use regex to clean up duplicate classNames
