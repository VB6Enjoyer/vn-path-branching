import re

with open('src/components/Editor.tsx', 'r') as f:
    content = f.read()

# Add states
state_injection = """  const [showFlowBrowser, setShowFlowBrowser] = useState(false);
  const [flowsList, setFlowsList] = useState<any[]>([]);
  const [flowsLoading, setFlowsLoading] = useState(false);
  const [flowsSearch, setFlowsSearch] = useState('');
  const [flowsSort, setFlowsSort] = useState<'title' | 'date' | 'author' | 'nodes'>('date');"""

content = content.replace("  const [showEndings, setShowEndings] = useState(false);", state_injection + "\n  const [showEndings, setShowEndings] = useState(false);")

# Add fetch function
fetch_injection = """  const fetchFlows = async () => {
    setFlowsLoading(true);
    try {
      const res = await fetch('/api/flows');
      const data = await res.json();
      if (data.flows) {
        setFlowsList(data.flows);
      }
    } catch (err) {
      console.error("Error fetching flows:", err);
    } finally {
      setFlowsLoading(false);
    }
  };

  useEffect(() => {
    if (showFlowBrowser) {
      fetchFlows();
    }
  }, [showFlowBrowser]);"""

content = re.sub(r'  const \[highlightedTargetId, setHighlightedTargetId\] = useState<string \| null>\(null\);', fetch_injection + '\n  const [highlightedTargetId, setHighlightedTargetId] = useState<string | null>(null);', content)

# Add fetch load logic
load_injection = """  const loadFlowFromUrl = async (filename: string) => {
    try {
      const res = await fetch(`/flows/${filename}`);
      const content = await res.text();
      const flow = JSON.parse(content);
      if (flow && flow.nodes && flow.edges) {
        triggerSnapshot(true);
        setNodes(flow.nodes);
        setEdges(flow.edges);
        setHighlightedTargetId(null);
      }
      if (flow && flow.settings) {
        if (flow.settings.light) setTimeout(() => setLightTheme({ ...defaultLightTheme, ...flow.settings.light }), 0);
        if (flow.settings.dark) setTimeout(() => setDarkTheme({ ...defaultDarkTheme, ...flow.settings.dark }), 0);
      }
      if (flow && flow.metadata) {
        setTimeout(() => {
          setFlowTitle(flow.metadata.title || '');
          setFlowAuthor(flow.metadata.author || '');
        }, 0);
      } else {
        setFlowTitle('');
        setFlowAuthor('');
      }
      setShowFlowBrowser(false);
    } catch (err) {
      alert("Error loading flow from server");
      console.error(err);
    }
  };"""

content = re.sub(r'  const onNodeClick = useCallback\(\(event: React.MouseEvent, node: Node\) => \{', load_injection + '\n\n  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {', content)

# Modify Toolbar
toolbar_replacement = """               <button
                  onClick={() => setShowFlowBrowser(true)}
                  title="Browse Flows"
                  className="flex-1 flex justify-center items-center py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition"
               >
                  <FolderOpen size={16} />
               </button>
               <button onClick={onExport} title="Export JSON" className="flex-1 flex justify-center items-center py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition">"""

content = content.replace("""               <button onClick={onExport} title="Export JSON" className="flex-1 flex justify-center items-center py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition">""", toolbar_replacement)

# Import FolderOpen
content = content.replace("Waypoints, EyeClosed, List } from 'lucide-react';", "Waypoints, EyeClosed, List, FolderOpen, Calendar, User, FileText } from 'lucide-react';")

# Add Browser Modal Modal
modal_html = """
        {showFlowBrowser && (
          <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xl rounded-xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
              <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2"><FolderOpen /> Browse Flows</h2>
                <button onClick={() => setShowFlowBrowser(false)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors"><XIcon size={20} className="text-gray-500" /></button>
              </div>

              <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row gap-4 items-center bg-white dark:bg-gray-900">
                <input
                  type="text"
                  placeholder="Search by title or author..."
                  className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-gray-100"
                  value={flowsSearch}
                  onChange={(e) => setFlowsSearch(e.target.value)}
                />
                <select
                  className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-gray-100 cursor-pointer"
                  value={flowsSort}
                  onChange={(e) => setFlowsSort(e.target.value as any)}
                >
                  <option value="date">Sort by Date</option>
                  <option value="title">Sort by Title</option>
                  <option value="author">Sort by Author</option>
                  <option value="nodes">Sort by Size (Nodes)</option>
                </select>
              </div>

              <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50/50 dark:bg-gray-900/50">
                {flowsLoading ? (
                  <div className="flex justify-center items-center h-full text-gray-500">Loading flows...</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {flowsList
                      .filter(f =>
                        f.title.toLowerCase().includes(flowsSearch.toLowerCase()) ||
                        f.author.toLowerCase().includes(flowsSearch.toLowerCase())
                      )
                      .sort((a, b) => {
                        if (flowsSort === 'title') return a.title.localeCompare(b.title);
                        if (flowsSort === 'author') return a.author.localeCompare(b.author);
                        if (flowsSort === 'nodes') return b.nodeCount - a.nodeCount;
                        // Date sorting (newest first), push null timestamps to bottom
                        if (!a.timestamp) return 1;
                        if (!b.timestamp) return -1;
                        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
                      })
                      .map((flow, i) => (
                        <div
                          key={i}
                          className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all cursor-pointer group flex flex-col"
                          onClick={() => loadFlowFromUrl(flow.filename)}
                        >
                          <div
                            className="h-32 w-full border-b border-gray-100 dark:border-gray-700 transition-colors"
                            style={{ backgroundColor: flow.canvasBg || '#f3f4f6' }}
                          ></div>
                          <div className="p-4 flex-1 flex flex-col">
                            <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100 mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1" title={flow.title}>{flow.title}</h3>
                            <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 mb-3">
                              <User size={12} /> <span className="truncate">{flow.author}</span>
                            </div>
                            <div className="mt-auto flex justify-between items-center text-xs text-gray-500 dark:text-gray-500 pt-3 border-t border-gray-100 dark:border-gray-700/50">
                              <span className="flex items-center gap-1"><FileText size={12} /> {flow.nodeCount} nodes</span>
                              {flow.timestamp && (
                                <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(flow.timestamp).toLocaleDateString()}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}

                    {flowsList.length === 0 && !flowsLoading && (
                      <div className="col-span-full text-center text-gray-500 py-12">
                        No flows found in the directory. Export a flow and place the JSON in the <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">public/flows</code> folder.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
"""

content = content.replace("      </div>\n    </div>\n  );\n}", modal_html + "\n      </div>\n    </div>\n  );\n}")

with open('src/components/Editor.tsx', 'w') as f:
    f.write(content)
