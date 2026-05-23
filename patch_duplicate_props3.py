import re

with open('src/components/nodes/OutcomeNode.tsx', 'r') as f:
    content = f.read()

# Fix the duplicate line
bad_line = """          className={`hover:text-red-300 hover:opacity-80 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity ${isLocked ? 'hidden' : ''}`}
          className={`hover:text-red-300 hover:opacity-80 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity ${isLocked ? 'hidden' : ''}`}"""
content = content.replace(bad_line, """          className={`hover:text-red-300 hover:opacity-80 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity ${isLocked ? 'hidden' : ''}`}\n""")

with open('src/components/nodes/OutcomeNode.tsx', 'w') as f:
    f.write(content)
