"use client";

import React, { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  Panel,
  ReactFlowProvider,
  useReactFlow
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { v4 as uuidv4 } from 'uuid';
import { Download, Upload, LocateFixed, Moon, Sun } from 'lucide-react';

import { DecisionNode, TextNode, OutcomeNode, CustomEdge } from './nodes';
import { getLayoutedElements } from '../utils/layout';

const nodeTypes = {
  decision: DecisionNode,
  text: TextNode,
  outcome: OutcomeNode,
};

const edgeTypes = {
  custom: CustomEdge,
};

const initialNodes: Node[] = [
  {
    id: 'start',
    type: 'decision',
    position: { x: 400, y: 100 },
    data: { prompt: 'The story begins...', choices: ['Choice 1', 'Choice 2'] },
  },
];

const initialEdges: Edge[] = [];

function FlowEditor() {
  const { fitView } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Set initial state without effect to avoid cascading
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('brain-map-theme') === 'dark';
    }
    return false;
  });

  // Auto-save logic
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Also load theme preference
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    }

    const saved = localStorage.getItem('brain-map-flow');
    if (saved) {
      try {
        const flow = JSON.parse(saved);
        if (flow && flow.nodes && flow.edges) {
          setNodes(flow.nodes);
          setEdges(flow.edges);
        }
      } catch (err) {
        console.error("Failed to load saved flow", err);
      }
    }

    // We defer setting isLoaded to the end of the effect
    const timer = setTimeout(() => setIsLoaded(true), 0);
    return () => clearTimeout(timer);
  }, [setNodes, setEdges, isDarkMode]);

  useEffect(() => {
    if (!isLoaded) return;
    const cleanNodes = nodes.map(n => {
      const cleanData = { ...n.data };
      delete cleanData.onChoicesChange;
      delete cleanData.onPromptChange;
      delete cleanData.onContentChange;
      delete cleanData.onOutcomeChange;
      delete cleanData.onTypeChange;
      delete cleanData.onDelete;
      return { ...n, data: cleanData };
    });
    localStorage.setItem('brain-map-flow', JSON.stringify({ nodes: cleanNodes, edges }));
  }, [nodes, edges, isLoaded]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('brain-map-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('brain-map-theme', 'light');
    }
  };

  // Node manipulation helpers
  const updateNodeData = useCallback((nodeId: string, newData: Record<string, unknown>) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return { ...node, data: { ...node.data, ...newData } };
        }
        return node;
      })
    );
  }, [setNodes]);

  const deleteNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
  }, [setNodes, setEdges]);

  // Inject callbacks into nodes
  const nodesWithCallbacks = useMemo(() => {
    return nodes.map(node => {
      const data: Record<string, unknown> = { ...node.data, onDelete: deleteNode };

      if (node.type === 'decision') {
        data.onChoicesChange = (id: string, choices: string[]) => {
          updateNodeData(id, { choices });
          // Update edge labels when choices change
          setEdges((eds) => eds.map((e) => {
            if (e.source === id) {
              const choiceIndexStr = e.sourceHandle?.replace('choice-', '');
              if (choiceIndexStr !== undefined) {
                const index = parseInt(choiceIndexStr, 10);
                if (!isNaN(index) && choices[index]) {
                  return { ...e, label: choices[index] };
                }
              }
            }
            return e;
          }));
        };
        data.onPromptChange = (id: string, prompt: string) => updateNodeData(id, { prompt });
      } else if (node.type === 'text') {
        data.onContentChange = (id: string, content: string) => updateNodeData(id, { content });
      } else if (node.type === 'outcome') {
        data.onOutcomeChange = (id: string, outcome: string) => updateNodeData(id, { outcome });
        data.onTypeChange = (id: string, type: string) => updateNodeData(id, { type });
      }

      return { ...node, data };
    });
  }, [nodes, updateNodeData, deleteNode, setEdges]);

  // Handle connections
  const onConnect = useCallback(
    (params: Connection) => {
      let label = '';

      if (params.sourceHandle?.startsWith('choice-')) {
        const sourceNode = nodes.find(n => n.id === params.source);
        if (sourceNode && Array.isArray(sourceNode.data.choices)) {
          const index = parseInt(params.sourceHandle.replace('choice-', ''), 10);
          if (!isNaN(index)) {
            label = sourceNode.data.choices[index] || '';
          }
        }
      }

      setEdges((eds) => addEdge({
        ...params,
        type: 'custom', // Use custom edge
        animated: true,
        label,
        // We handle styling in CustomEdge now, but react-flow might still use these
      }, eds));
    },
    [setEdges, nodes],
  );

  const onLayout = useCallback(
    (direction: string) => {
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
        nodes,
        edges,
        direction
      );
      setNodes([...layoutedNodes]);
      setEdges([...layoutedEdges]);
    },
    [nodes, edges, setNodes, setEdges]
  );

  const addNode = (type: 'decision' | 'text' | 'outcome') => {
    const newNode: Node = {
      id: uuidv4(),
      type,
      position: { x: window.innerWidth / 2 - 100, y: window.innerHeight / 2 - 100 },
      data:
        type === 'decision' ? { prompt: 'New Decision', choices: ['Choice A', 'Choice B'] } :
        type === 'text' ? { content: 'New Note' } :
        { outcome: 'New Ending', type: 'neutral' },
    };
    setNodes((nds) => nds.concat(newNode));
  };

  const centerOnStart = () => {
    const startNode = nodes.find(n => n.id === 'start') || nodes[0];
    if (startNode) {
      fitView({ nodes: [{ id: startNode.id }], duration: 800, padding: 3 });
    }
  };

  const onExport = () => {
    const cleanNodes = nodes.map(n => {
        const cleanData = { ...n.data };
        delete cleanData.onChoicesChange;
        delete cleanData.onPromptChange;
        delete cleanData.onContentChange;
        delete cleanData.onOutcomeChange;
        delete cleanData.onTypeChange;
        delete cleanData.onDelete;
        return { ...n, data: cleanData };
    });

    const flow = { nodes: cleanNodes, edges };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(flow, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", "brain-map-flow.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const onImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const flow = JSON.parse(content);
        if (flow && flow.nodes && flow.edges) {
          setNodes(flow.nodes);
          setEdges(flow.edges);
        }
      } catch (err) {
        alert("Error parsing JSON file");
        console.error(err);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full h-screen relative bg-gray-50 dark:bg-gray-900 transition-colors">
      <ReactFlow
        nodes={nodesWithCallbacks}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        colorMode={isDarkMode ? 'dark' : 'light'}
        fitView
        className="bg-gray-50 dark:bg-gray-900"
      >
        <Background gap={12} size={1} color={isDarkMode ? '#374151' : '#cbd5e1'} />
        <Controls className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200" />
        <MiniMap
          nodeColor={isDarkMode ? '#4b5563' : '#e2e8f0'}
          maskColor={isDarkMode ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)'}
          style={{ backgroundColor: isDarkMode ? '#1f2937' : '#ffffff' }}
        />

        <Panel position="top-right" className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 flex flex-col gap-2 w-48 transition-colors">
          <div className="flex justify-between items-center mb-1">
            <h3 className="font-bold text-sm text-gray-700 dark:text-gray-200">Add Nodes</h3>
            <button
              onClick={toggleTheme}
              className="p-1 rounded-full text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 bg-gray-100 dark:bg-gray-700 transition"
              title="Toggle Dark Mode"
            >
              {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
            </button>
          </div>
          <button onClick={() => addNode('decision')} className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded text-sm hover:bg-blue-100 dark:hover:bg-blue-900/50 transition text-left">Decision</button>
          <button onClick={() => addNode('text')} className="px-3 py-1.5 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800 rounded text-sm hover:bg-yellow-100 dark:hover:bg-yellow-900/50 transition text-left">Note / Event</button>
          <button onClick={() => addNode('outcome')} className="px-3 py-1.5 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 rounded text-sm hover:bg-purple-100 dark:hover:bg-purple-900/50 transition text-left">Outcome</button>

          <hr className="my-1 border-gray-100 dark:border-gray-700" />

          <h3 className="font-bold text-sm mb-1 text-gray-700 dark:text-gray-200">Actions</h3>
          <button onClick={() => onLayout('TB')} className="px-3 py-1.5 bg-gray-800 dark:bg-gray-700 text-white rounded text-sm hover:bg-gray-700 dark:hover:bg-gray-600 transition">Auto Layout Tree</button>
          <button onClick={centerOnStart} className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded text-sm hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition flex items-center justify-center gap-2">
            <LocateFixed size={14} /> Locate Start
          </button>

          <div className="flex gap-2 mt-1">
             <button onClick={onExport} title="Export JSON" className="flex-1 flex justify-center items-center py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                <Download size={16} />
             </button>
             <button onClick={() => fileInputRef.current?.click()} title="Import JSON" className="flex-1 flex justify-center items-center py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                <Upload size={16} />
             </button>
             <input type="file" ref={fileInputRef} onChange={onImport} accept=".json" className="hidden" />
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}

export default function Editor() {
  return (
    <ReactFlowProvider>
      <FlowEditor />
    </ReactFlowProvider>
  );
}
