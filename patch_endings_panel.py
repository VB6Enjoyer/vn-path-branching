import re

with open('src/components/Editor.tsx', 'r') as f:
    content = f.read()

# We need the `reactFlowInstance` to center the view. Since `useReactFlow()` is already called at the top,
# we just need to ensure we use it.
# Wait, `const reactFlowInstance = useReactFlow();` might not be assigned if we just extracted `{ setNodes, setEdges } = useReactFlow();`
# Let's check how useReactFlow is used.

if "const reactFlowInstance = useReactFlow();" not in content and "const { setNodes, setEdges, fitView, setCenter } = useReactFlow();" not in content:
    # Let's see how it's used
    pass

panel_injection = """
          {showEndings && (
            <Panel position="top-right" className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col gap-3 w-72 max-h-[80vh] overflow-y-auto mt-2 pointer-events-auto" style={{ top: 'auto', bottom: 'auto', left: 'auto', right: '14rem' }}>
              <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
                <h3 className="font-bold text-sm text-gray-800 dark:text-gray-100 flex items-center gap-2"><List size={16} /> Endings Directory</h3>
                <button onClick={() => setShowEndings(false)} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100"><XIcon size={16} /></button>
              </div>
              <div className="flex flex-col gap-2">
                {nodes.filter(n => n.type === 'outcome').length === 0 ? (
                  <p className="text-xs text-gray-500 dark:text-gray-400 italic text-center py-4">No endings found.</p>
                ) : (
                  nodes.filter(n => n.type === 'outcome').map((node) => {
                    const outcomeType = node.data.outcomeType as 'good' | 'bad' | 'neutral' || 'neutral';
                    const isRevealed = revealedNodeIds.has(node.id);
                    const isBlurred = isSpoilerMode && !isRevealed;

                    let bgClass = 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200';
                    if (!isBlurred) {
                      if (outcomeType === 'good') bgClass = 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200';
                      if (outcomeType === 'bad') bgClass = 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200';
                    }

                    return (
                      <div key={node.id} className={`flex flex-col gap-2 p-2 rounded border ${bgClass}`}>
                        <div className="flex items-center justify-between">
                           <span className={`text-sm font-semibold truncate flex-1 ${isBlurred ? 'blur-sm select-none' : ''}`}>
                             {node.data.label as string || 'Unnamed Outcome'}
                           </span>
                           {!isBlurred && (
                             <span className="text-[10px] uppercase font-bold opacity-60 ml-2 tracking-wider">
                               {outcomeType}
                             </span>
                           )}
                        </div>
                        <div className="flex gap-1 mt-1">
                          <button
                            className="flex-1 flex items-center justify-center gap-1 py-1 px-2 text-xs bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            onClick={() => setHighlightedTargetId(node.id)}
                            title="Highlight path to this ending"
                          >
                            <Waypoints size={12} /> Highlight Path
                          </button>
                          <button
                            className="flex items-center justify-center py-1 px-2 text-xs bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            onClick={() => {
                               // Quick and dirty pan to node
                               const el = document.querySelector(`[data-id="${node.id}"]`);
                               if (el) {
                                 el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
                               }
                            }}
                            title="Locate in canvas"
                          >
                            <LocateFixed size={12} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </Panel>
          )}
"""

content = content.replace("{showSettings && (", panel_injection + "\n          {showSettings && (")

with open('src/components/Editor.tsx', 'w') as f:
    f.write(content)
