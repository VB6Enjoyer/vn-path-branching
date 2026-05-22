import re

with open('src/components/Editor.tsx', 'r') as f:
    content = f.read()

replacement = """              <>
                <div className="px-3 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase border-b border-gray-100 dark:border-gray-700 mb-1">Create node</div>
                <button className="px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200" onClick={() => addNode('decision', menu.x, menu.y, menu.connectionParams)}>Decision Node</button>
                <button className="px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200" onClick={() => addNode('text', menu.x, menu.y, menu.connectionParams)}>Note / Event Node</button>
                <button className="px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200" onClick={() => addNode('outcome', menu.x, menu.y, menu.connectionParams)}>Outcome Node</button>
                <div className="h-px bg-gray-200 dark:bg-gray-700 my-1 mx-2"></div>
                <button className="px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200" onClick={() => addNode('image', menu.x, menu.y, menu.connectionParams)}>Decorative Image</button>
                {highlightedTargetId && (
                   <button className="flex items-center gap-2 px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-cyan-600 dark:text-cyan-400 mt-1 border-t border-gray-100 dark:border-gray-700 pt-2" onClick={() => { setHighlightedTargetId(null); setMenu(prev => ({...prev, show: false})); }}>
                     <Waypoints size={14} /> Hide Path
                   </button>
                )}
              </>"""

content = re.sub(r'              <>\n                <div className="px-3 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase border-b border-gray-100 dark:border-gray-700 mb-1">Create node</div>[\s\S]+?              </>', replacement, content)

with open('src/components/Editor.tsx', 'w') as f:
    f.write(content)
