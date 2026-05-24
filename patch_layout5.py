with open('src/utils/layout.ts', 'r') as f:
    content = f.read()

content = content.replace("const getHandleIndex = (handle) => {", "const getHandleIndex = (handle: string | null | undefined) => {")

with open('src/utils/layout.ts', 'w') as f:
    f.write(content)
