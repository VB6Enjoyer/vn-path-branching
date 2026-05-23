import re

with open('src/components/Editor.tsx', 'r') as f:
    content = f.read()

# Add Lock, Unlock icons
content = content.replace("FolderOpen, Calendar, User, FileText } from 'lucide-react';", "FolderOpen, Calendar, User, FileText, Lock, Unlock } from 'lucide-react';")

# Add isLocked state
state_injection = """  const [syncSharedSettings, setSyncSharedSettings] = useState(true);
  const [isLocked, setIsLocked] = useState(false);"""
content = content.replace("  const [syncSharedSettings, setSyncSharedSettings] = useState(true);", state_injection)

# Add lock button to toolbar
toolbar_injection = """                <button
                  onClick={() => setIsLocked(!isLocked)}
                  className={`p-1 rounded-full transition ${isLocked ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 bg-gray-100 dark:bg-gray-700'}`}
                  title={isLocked ? "Unlock Canvas" : "Lock Canvas (Read-Only)"}
                >
                  {isLocked ? <Lock size={14} /> : <Unlock size={14} />}
                </button>
                <button
                  onClick={() => { setShowSettings(!showSettings); setShowEndings(false); }}"""
content = content.replace("""                <button
                  onClick={() => { setShowSettings(!showSettings); setShowEndings(false); }}""", toolbar_injection)

# Update ReactFlow and Controls
content = content.replace("<Controls />", "<Controls showInteractive={false} />")

reactflow_replacement = """        <ReactFlow
          nodes={nodesWithCallbacks}
          edges={edgesWithCallbacks}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onConnectStart={onConnectStart}
          onConnectEnd={onConnectEnd}
          onPaneClick={onPaneClick}
          onPaneContextMenu={onPaneContextMenu}
          onNodeContextMenu={onNodeContextMenu}
          nodesDraggable={!isLocked}
          nodesConnectable={!isLocked}
          elementsSelectable={!isLocked}
          edgesFocusable={!isLocked}"""

content = re.sub(r'        <ReactFlow\n          nodes=\{nodesWithCallbacks\}\n          edges=\{edgesWithCallbacks\}\n          onNodesChange=\{onNodesChange\}\n          onEdgesChange=\{onEdgesChange\}\n          onConnect=\{onConnect\}\n          onConnectStart=\{onConnectStart\}\n          onConnectEnd=\{onConnectEnd\}\n          onPaneClick=\{onPaneClick\}\n          onPaneContextMenu=\{onPaneContextMenu\}\n          onNodeContextMenu=\{onNodeContextMenu\}', reactflow_replacement, content)

with open('src/components/Editor.tsx', 'w') as f:
    f.write(content)
