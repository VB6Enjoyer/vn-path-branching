import re

with open('src/components/Editor.tsx', 'r') as f:
    content = f.read()

# 1. Add title and author state
state_injection = """  const [showEndings, setShowEndings] = useState(false);
  const [flowTitle, setFlowTitle] = useState<string>('');
  const [flowAuthor, setFlowAuthor] = useState<string>('');"""
content = content.replace("  const [showEndings, setShowEndings] = useState(false);", state_injection)

# 2. Update onExport
export_replacement = """  const onExport = () => {
    const saveObj = {
      metadata: {
        title: flowTitle,
        author: flowAuthor,
        timestamp: new Date().toISOString()
      },
      nodes: getCleanNodes(nodes),
      edges,
      settings: { light: lightTheme, dark: darkTheme }
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(saveObj, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    const filename = flowTitle ? `${flowTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json` : "brain-map-flow.json";
    downloadAnchorNode.setAttribute("download", filename);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };"""

content = re.sub(r'  const onExport = \(\) => \{[\s\S]+?  \};', export_replacement, content)

# 3. Update onImport
import_replacement = """  const onImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
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
      } catch (err) {
        alert("Error parsing JSON file");
        console.error(err);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };"""

content = re.sub(r'  const onImport = \(event: React.ChangeEvent<HTMLInputElement>\) => \{[\s\S]+?fileInputRef.current.value = \'\';\n  \};', import_replacement, content)

# 4. Add inputs to Visual Settings panel
settings_injection = """              <div className="flex flex-col gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                <div className="flex justify-between items-center group/row">
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-300 w-16">Title</label>
                  <input type="text" value={flowTitle} onChange={(e) => setFlowTitle(e.target.value)} placeholder="Untitled Flow" className="w-40 text-xs p-1 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-gray-100" />
                </div>
                <div className="flex justify-between items-center group/row">
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-300 w-16">Author</label>
                  <input type="text" value={flowAuthor} onChange={(e) => setFlowAuthor(e.target.value)} placeholder="Anonymous" className="w-40 text-xs p-1 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-gray-100" />
                </div>
              </div>
              <div className="flex flex-col gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">"""

content = content.replace("""              <div className="flex flex-col gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                <SettingRow label="Canvas Bg" settingKey="canvasBg" activeTheme={activeTheme} activeDefaultTheme={activeDefaultTheme} updateActiveTheme={updateActiveTheme} resetSetting={resetSetting} />""", settings_injection + """\n                <SettingRow label="Canvas Bg" settingKey="canvasBg" activeTheme={activeTheme} activeDefaultTheme={activeDefaultTheme} updateActiveTheme={updateActiveTheme} resetSetting={resetSetting} />""")

with open('src/components/Editor.tsx', 'w') as f:
    f.write(content)
