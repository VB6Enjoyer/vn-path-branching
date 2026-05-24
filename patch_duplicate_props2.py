import re

with open('src/components/nodes/DecisionNode.tsx', 'r') as f:
    content = f.read()

# I see what I did: I replaced a button completely, but I left the old `className="w-full py-1 text-sm border rounded flex items-center justify-center gap-1 transition-colors hover:opacity-80"` or similar intact from the `addChoice` button.
# Let's fix lines 153/154.
content = content.replace("          className={`w-full text-xs py-1 border-t transition-colors mt-2 ${isLocked ? 'hidden' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}\n          className=\"w-full py-1 text-sm border rounded flex items-center justify-center gap-1 transition-colors hover:opacity-80\"",
                          "          className={`w-full py-1 text-sm border rounded flex items-center justify-center gap-1 transition-colors mt-2 ${isLocked ? 'hidden' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}")

with open('src/components/nodes/DecisionNode.tsx', 'w') as f:
    f.write(content)

with open('src/components/nodes/OutcomeNode.tsx', 'r') as f:
    content = f.read()

# Find the duplicate props in OutcomeNode
content = content.replace("          className={`hover:text-red-300 hover:opacity-80 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity ${isLocked ? 'hidden' : ''}`}\n          className=\"hover:text-red-300 hover:opacity-80 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity\"",
                          "          className={`hover:text-red-300 hover:opacity-80 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity ${isLocked ? 'hidden' : ''}`}")

with open('src/components/nodes/OutcomeNode.tsx', 'w') as f:
    f.write(content)
