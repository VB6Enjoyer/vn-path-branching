import re

with open('src/components/nodes/DecorativeNode.tsx', 'r') as f:
    content = f.read()

# NodeResizer doesn't have a 'disabled' prop.
# We should instead conditionally render it:
# { !isLocked && <NodeResizer ... /> }

bad_resizer = """      <NodeResizer
        disabled={isLocked}
        color="var(--path-highlight-color)"
        isVisible={selected}
        minWidth={100}
        minHeight={100}
      />"""

good_resizer = """      {!isLocked && (
        <NodeResizer
          color="var(--path-highlight-color)"
          isVisible={selected}
          minWidth={100}
          minHeight={100}
        />
      )}"""

content = content.replace(bad_resizer, good_resizer)

with open('src/components/nodes/DecorativeNode.tsx', 'w') as f:
    f.write(content)
