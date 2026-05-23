import re

with open('src/components/Editor.tsx', 'r') as f:
    content = f.read()

# Update load from localStorage
load_replacement = """        const flow = JSON.parse(saved);
        if (flow && flow.nodes && flow.edges) {
          setNodes(flow.nodes);
          setEdges(flow.edges);
        }
        if (flow && flow.settings) {
          if (flow.settings.light) setLightTheme({ ...defaultLightTheme, ...flow.settings.light });
          if (flow.settings.dark) setDarkTheme({ ...defaultDarkTheme, ...flow.settings.dark });
        }
        if (flow && flow.metadata) {
          setFlowTitle(flow.metadata.title || '');
          setFlowAuthor(flow.metadata.author || '');
        }"""
content = re.sub(r'        const flow = JSON\.parse\(saved\);\n        if \(flow && flow\.nodes && flow\.edges\) \{[\s\S]+?          if \(flow\.settings\.dark\) setDarkTheme\(\{ \.\.\.defaultDarkTheme, \.\.\.flow\.settings\.dark \}\);\n        \}', load_replacement, content)

# Update save to localStorage
save_replacement = """  useEffect(() => {
    if (!isLoaded) return;
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
    localStorage.setItem('brain-map-flow', JSON.stringify(saveObj));
  }, [nodes, edges, lightTheme, darkTheme, isLoaded, flowTitle, flowAuthor]);"""
content = re.sub(r'  useEffect\(\(\) => \{\n    if \(\!isLoaded\) return;\n    const saveObj = \{ \n      nodes: getCleanNodes\(nodes\), \n      edges,\n      settings: \{ light: lightTheme, dark: darkTheme \}\n    \};\n    localStorage\.setItem\(\'brain-map-flow\', JSON\.stringify\(saveObj\)\);\n  \}, \[nodes, edges, lightTheme, darkTheme, isLoaded\]\);', save_replacement, content)

with open('src/components/Editor.tsx', 'w') as f:
    f.write(content)
