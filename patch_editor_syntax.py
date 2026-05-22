import re

with open('src/components/Editor.tsx', 'r') as f:
    content = f.read()

# I likely messed up a closing tag or parenthesis when inserting the modal. Let's find it.
# The ReactFlow component closes like this:
#         </ReactFlow>
#
#         {showFlowBrowser && (

if "</ReactFlow>" in content:
    print("Found ReactFlow close")
else:
    print("ReactFlow close missing")

# Wait, let's look at what's missing
