import re

with open('src/components/Editor.tsx', 'r') as f:
    content = f.read()

# Disable context menus
content = content.replace("const onPaneContextMenu = useCallback(\n    (event: MouseEvent | React.MouseEvent) => {\n      if (event.shiftKey) return; \n      event.preventDefault();",
                          "const onPaneContextMenu = useCallback(\n    (event: MouseEvent | React.MouseEvent) => {\n      if (isLocked || event.shiftKey) return; \n      event.preventDefault();")
content = content.replace("const onNodeContextMenu = useCallback(\n    (event: MouseEvent | React.MouseEvent, node: Node) => {\n      if (event.shiftKey) return; \n      event.preventDefault();",
                          "const onNodeContextMenu = useCallback(\n    (event: MouseEvent | React.MouseEvent, node: Node) => {\n      if (isLocked || event.shiftKey) return; \n      event.preventDefault();")

# Update dependency arrays for context menus
content = re.sub(r'  const onPaneContextMenu = useCallback\([\s\S]+?    \}\n    \},\n    \[\]\n  \);', lambda m: m.group(0).replace("[]", "[isLocked]"), content)
content = re.sub(r'  const onNodeContextMenu = useCallback\([\s\S]+?    \}\n    \},\n    \[\]\n  \);', lambda m: m.group(0).replace("[]", "[isLocked]"), content)

# Lock when importing or loading from URL
content = content.replace("setHighlightedTargetId(null);\n        }\n        if (flow && flow.settings)",
                          "setHighlightedTargetId(null);\n          setIsLocked(true);\n        }\n        if (flow && flow.settings)")

# Disable bottom-left floating buttons
content = content.replace('className="p-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-lg shadow-md hover:bg-gray-200 dark:hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed"',
                          'className="p-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-lg shadow-md hover:bg-gray-200 dark:hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed"\n            disabled={isLocked}')
content = content.replace('className="px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-sm font-semibold rounded-lg shadow-md hover:bg-gray-200 dark:hover:bg-gray-700 transition"',
                          'className="px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-sm font-semibold rounded-lg shadow-md hover:bg-gray-200 dark:hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed"\n            disabled={isLocked}')

# Disable import button
content = content.replace('onClick={() => fileInputRef.current?.click()}', 'onClick={() => !isLocked && fileInputRef.current?.click()}')
content = content.replace('title="Import JSON"', 'title={isLocked ? "Unlock to Import JSON" : "Import JSON"}')

with open('src/components/Editor.tsx', 'w') as f:
    f.write(content)
