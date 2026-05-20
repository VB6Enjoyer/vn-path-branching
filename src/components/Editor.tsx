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
import { Download, Upload, LocateFixed, Moon, Sun, Settings, X as XIcon, RotateCcw, Undo2, Redo2, FilePlus } from 'lucide-react';
import debounce from 'lodash.debounce';

import { DecisionNode, TextNode, OutcomeNode, CustomEdge } from './nodes';
import { getLayoutedElements } from '../utils/layout';
import { ThemeSettings, defaultLightTheme, defaultDarkTheme } from '../types';

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

// Popular Google Fonts for the datalist
const popularFonts = [
  "Inter", "Roboto", "Open Sans", "Lato", "Montserrat", "Poppins",
  "Source Sans Pro", "Oswald", "Raleway", "Playfair Display", "Merriweather"
];

const SettingRow = ({
  label,
  settingKey,
  type = "color",
  list,
  activeTheme,
  activeDefaultTheme,
  resetSetting,
  updateActiveTheme
}: {
  label: string,
  settingKey: keyof ThemeSettings,
  type?: "color" | "text",
  list?: string,
  activeTheme: ThemeSettings,
  activeDefaultTheme: ThemeSettings,
  resetSetting: (key: keyof ThemeSettings) => void,
  updateActiveTheme: (key: keyof ThemeSettings, value: string) => void
}) => {
  const isDefault = activeTheme[settingKey] === activeDefaultTheme[settingKey];
  return (
    <div className="flex justify-between items-center group/row">
      <label className="text-xs font-semibold text-gray-600 dark:text-gray-300 flex-1">{label}</label>
      <div className="flex items-center gap-1">
        <button
          onClick={() => resetSetting(settingKey)}
          className={`text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-opacity p-0.5 rounded ${isDefault ? 'opacity-0 cursor-default' : 'opacity-100'}`}
          disabled={isDefault}
          title="Reset to default"
        >
          <RotateCcw size={12} />
        </button>
        <input
          type={type}
          list={list}
          value={activeTheme[settingKey]}
          onChange={(e) => updateActiveTheme(settingKey, e.target.value)}
          className={type === 'color' ? "w-8 h-8 rounded cursor-pointer border-0 p-0" : "w-28 text-xs p-1 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-gray-100"}
        />
      </div>
    </div>
  );
};

// Clean nodes helper (strips callbacks)
const getCleanNodes = (nodesToClean: Node[]) => {
  return nodesToClean.map(n => {
    const cleanData = { ...n.data };
    delete cleanData.onChoicesChange;
    delete cleanData.onPromptChange;
    delete cleanData.onContentChange;
    delete cleanData.onOutcomeChange;
    delete cleanData.onTypeChange;
    delete cleanData.onDelete;
    delete cleanData.onTextHiddenChange;
    return { ...n, data: cleanData };
  });
};

const MAX_HISTORY = 30;

function FlowEditor() {
  const { fitView, screenToFlowPosition } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('brain-map-theme') === 'dark';
    }
    return false;
  });

  // Theming state
  const [lightTheme, setLightTheme] = useState<ThemeSettings>(defaultLightTheme);
  const [darkTheme, setDarkTheme] = useState<ThemeSettings>(defaultDarkTheme);
  const [showSettings, setShowSettings] = useState(false);

  const activeTheme = isDarkMode ? darkTheme : lightTheme;
  const activeDefaultTheme = isDarkMode ? defaultDarkTheme : defaultLightTheme;

  const [isLoaded, setIsLoaded] = useState(false);
  const [menu, setMenu] = useState<{ x: number, y: number, show: boolean, params?: {source: string, sourceHandle?: string} }>({ x: 0, y: 0, show: false });
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  const isConnectingRef = useRef(false);

  // Undo / Redo state
  const [past, setPast] = useState<{nodes: Node[], edges: Edge[]}[]>([]);
  const [future, setFuture] = useState<{nodes: Node[], edges: Edge[]}[]>([]);

  // Snapshot logic
  const takeSnapshot = useCallback(() => {
    setPast((prev) => {
      const currentClean = { nodes: getCleanNodes(nodes), edges };
      const newPast = [...prev, currentClean];
      if (newPast.length > MAX_HISTORY) {
        newPast.shift(); // remove oldest to respect limit
      }
      return newPast;
    });
    setFuture([]); // clear redo stack on new action
  }, [nodes, edges]);

  // Use a ref for the debounced snapshot so it doesn't get recreated on every render
  const debouncedSnapshotRef = useRef(debounce(takeSnapshot, 1000));

  // Keep the ref updated with the latest takeSnapshot
  useEffect(() => {
    debouncedSnapshotRef.current = debounce(takeSnapshot, 1000);
  }, [takeSnapshot]);

  const triggerSnapshot = useCallback((immediate: boolean = true) => {
    if (immediate) {
      debouncedSnapshotRef.current.cancel();
      takeSnapshot();
    } else {
      debouncedSnapshotRef.current();
    }
  }, [takeSnapshot]);

  const undo = useCallback(() => {
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);

    setFuture((prev) => [{ nodes: getCleanNodes(nodes), edges }, ...prev]);
    setPast(newPast);

    setNodes(previous.nodes);
    setEdges(previous.edges);
  }, [past, nodes, edges, setNodes, setEdges]);

  const redo = useCallback(() => {
    if (future.length === 0) return;
    const next = future[0];
    const newFuture = future.slice(1);

    setPast((prev) => {
      const newPast = [...prev, { nodes: getCleanNodes(nodes), edges }];
      if (newPast.length > MAX_HISTORY) newPast.shift();
      return newPast;
    });
    setFuture(newFuture);

    setNodes(next.nodes);
    setEdges(next.edges);
  }, [future, nodes, edges, setNodes, setEdges]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  useEffect(() => {
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
        if (flow && flow.settings) {
          if (flow.settings.light) setTimeout(() => setLightTheme(flow.settings.light), 0);
          if (flow.settings.dark) setTimeout(() => setDarkTheme(flow.settings.dark), 0);
        }
      } catch (err) {
        console.error("Failed to load saved flow", err);
      }
    }

    const timer = setTimeout(() => setIsLoaded(true), 0);
    return () => clearTimeout(timer);
  }, [setNodes, setEdges, isDarkMode]);

  useEffect(() => {
    if (!isLoaded) return;
    const saveObj = {
      nodes: getCleanNodes(nodes),
      edges,
      settings: { light: lightTheme, dark: darkTheme }
    };
    localStorage.setItem('brain-map-flow', JSON.stringify(saveObj));
  }, [nodes, edges, lightTheme, darkTheme, isLoaded]);

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

  const updateActiveTheme = useCallback((key: keyof ThemeSettings, value: string) => {
    if (isDarkMode) {
      setDarkTheme(prev => ({ ...prev, [key]: value }));
    } else {
      setLightTheme(prev => ({ ...prev, [key]: value }));
    }
  }, [isDarkMode]);

  const resetSetting = useCallback((key: keyof ThemeSettings) => {
    if (isDarkMode) {
      setDarkTheme(prev => ({ ...prev, [key]: defaultDarkTheme[key] }));
    } else {
      setLightTheme(prev => ({ ...prev, [key]: defaultLightTheme[key] }));
    }
  }, [isDarkMode]);

  const resetAllSettings = () => {
    if (window.confirm("Are you sure you want to reset all visual settings to their defaults? This affects both Light and Dark modes.")) {
      setLightTheme(defaultLightTheme);
      setDarkTheme(defaultDarkTheme);
    }
  };

  const startFromScratch = () => {
    if (window.confirm("WARNING: Are you sure you want to start from scratch? This will clear all nodes, connections, and visual settings, and cannot be undone.")) {
      setPast([]);
      setFuture([]);
      setNodes(initialNodes);
      setEdges(initialEdges);
      setLightTheme(defaultLightTheme);
      setDarkTheme(defaultDarkTheme);
    }
  };

  const updateNodeData = useCallback((nodeId: string, newData: Record<string, unknown>, immediateSnapshot: boolean = false) => {
    triggerSnapshot(immediateSnapshot);
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return { ...node, data: { ...node.data, ...newData } };
        }
        return node;
      })
    );
  }, [setNodes, triggerSnapshot]);

  const deleteNode = useCallback((nodeId: string) => {
    triggerSnapshot(true);
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
  }, [setNodes, setEdges, triggerSnapshot]);

  const nodesWithCallbacks = useMemo(() => {
    return nodes.map(node => {
      const data: Record<string, unknown> = { ...node.data, onDelete: deleteNode };

      if (node.type === 'decision') {
        data.onChoicesChange = (id: string, choices: string[]) => {
          updateNodeData(id, { choices }, true); // Structual, snapshot immediately
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
        // Debounce text changes
        data.onPromptChange = (id: string, prompt: string) => updateNodeData(id, { prompt }, false);
        data.onTextHiddenChange = (id: string, isTextHidden: boolean) => updateNodeData(id, { isTextHidden }, true);
      } else if (node.type === 'text') {
        data.onContentChange = (id: string, content: string) => updateNodeData(id, { content }, false);
      } else if (node.type === 'outcome') {
        data.onOutcomeChange = (id: string, outcome: string) => updateNodeData(id, { outcome }, false);
        data.onTypeChange = (id: string, type: string) => updateNodeData(id, { type }, true);
      }

      return { ...node, data };
    });
  }, [nodes, updateNodeData, deleteNode, setEdges]);

  const onConnectStart = useCallback(() => {
    isConnectingRef.current = true;
  }, []);

  const onConnect = useCallback(
    (params: Connection) => {
      triggerSnapshot(true);
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
        type: 'custom',
        animated: true,
        label,
      }, eds));

      isConnectingRef.current = false;
    },
    [setEdges, nodes, triggerSnapshot],
  );

  const onConnectEnd = useCallback(
    (event: MouseEvent | TouchEvent, connectionState: { isValid: boolean | null; fromNode: Node | null; fromHandle: { id?: string | null } | null }) => {
      if (!connectionState.isValid && connectionState.fromNode) {
        let clientX = 0, clientY = 0;
        if (event instanceof MouseEvent) {
          clientX = event.clientX;
          clientY = event.clientY;
        } else if (event instanceof TouchEvent && event.touches.length > 0) {
          clientX = event.touches[0].clientX;
          clientY = event.touches[0].clientY;
        }

        const target = document.elementFromPoint(clientX, clientY);
        const nodeElement = target?.closest('.react-flow__node');

        if (nodeElement) {
          const targetNodeId = nodeElement.getAttribute('data-id');
          if (targetNodeId && targetNodeId !== connectionState.fromNode.id) {
            const params: Connection = {
              source: connectionState.fromNode.id,
              sourceHandle: connectionState.fromHandle?.id || null,
              target: targetNodeId,
              targetHandle: null
            };
            onConnect(params);
            return;
          }
        }

        if (reactFlowWrapper.current) {
          const { top, left } = reactFlowWrapper.current.getBoundingClientRect();
          setMenu({
            show: true,
            x: clientX - left,
            y: clientY - top,
            params: {
              source: connectionState.fromNode.id,
              sourceHandle: connectionState.fromHandle?.id || undefined,
            }
          });
        }
      }

      setTimeout(() => {
        isConnectingRef.current = false;
      }, 50);
    },
    [onConnect]
  );

  const onPaneClick = useCallback(() => {
    if (isConnectingRef.current) return;
    setMenu({ show: false, x: 0, y: 0 });
  }, []);

  const onLayout = useCallback(
    (direction: string) => {
      triggerSnapshot(true);
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
        nodes,
        edges,
        direction
      );
      setNodes([...layoutedNodes]);
      setEdges([...layoutedEdges]);
    },
    [nodes, edges, setNodes, setEdges, triggerSnapshot]
  );

  const addNode = (type: 'decision' | 'text' | 'outcome', menuX?: number, menuY?: number, connectionParams?: {source: string, sourceHandle?: string}) => {
    triggerSnapshot(true);
    let position = { x: window.innerWidth / 2 - 100, y: window.innerHeight / 2 - 100 };
    if (menuX !== undefined && menuY !== undefined && reactFlowWrapper.current) {
       const { left, top } = reactFlowWrapper.current.getBoundingClientRect();
       position = screenToFlowPosition({ x: menuX + left, y: menuY + top });
    }

    const id = uuidv4();
    const newNode: Node = {
      id,
      type,
      position,
      data:
        type === 'decision' ? { prompt: 'New Decision', choices: ['Choice A', 'Choice B'] } :
        type === 'text' ? { content: 'New Note' } :
        { outcome: 'New Ending', type: 'neutral' },
    };

    setNodes((nds) => nds.concat(newNode));

    if (connectionParams && connectionParams.source) {
       let label = '';
       if (connectionParams.sourceHandle?.startsWith('choice-')) {
         const sourceNode = nodes.find(n => n.id === connectionParams.source);
         if (sourceNode && Array.isArray(sourceNode.data.choices)) {
           const index = parseInt(connectionParams.sourceHandle.replace('choice-', ''), 10);
           if (!isNaN(index)) {
             label = sourceNode.data.choices[index] || '';
           }
         }
       }

       setEdges((eds) => addEdge({
         id: `e-${connectionParams.source}-${id}`,
         source: connectionParams.source,
         sourceHandle: connectionParams.sourceHandle || null,
         target: id,
         targetHandle: null,
         type: 'custom',
         animated: true,
         label
       }, eds));
    }
    setMenu({ show: false, x: 0, y: 0 });
  };

  const centerOnStart = () => {
    const startNode = nodes.find(n => n.id === 'start') || nodes[0];
    if (startNode) {
      fitView({ nodes: [{ id: startNode.id }], duration: 800, padding: 3 });
    }
  };

  const onExport = () => {
    const saveObj = {
      nodes: getCleanNodes(nodes),
      edges,
      settings: { light: lightTheme, dark: darkTheme }
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(saveObj, null, 2));
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
          triggerSnapshot(true);
          setNodes(flow.nodes);
          setEdges(flow.edges);
        }
        if (flow && flow.settings) {
          if (flow.settings.light) setTimeout(() => setLightTheme(flow.settings.light), 0);
          if (flow.settings.dark) setTimeout(() => setDarkTheme(flow.settings.dark), 0);
        }
      } catch (err) {
        alert("Error parsing JSON file");
        console.error(err);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const onNodeDragStart = useCallback(() => {
    triggerSnapshot(true);
  }, [triggerSnapshot]);

  // Hook for Edge deletion
  const handleDeleteEdge = useCallback((edgeId: string) => {
    triggerSnapshot(true);
    setEdges((eds) => eds.filter((e) => e.id !== edgeId));
  }, [setEdges, triggerSnapshot]);

  // Pass handleDeleteEdge to edges
  const edgesWithCallbacks = useMemo(() => {
    return edges.map(edge => ({
      ...edge,
      data: { ...edge.data, onDelete: handleDeleteEdge }
    }));
  }, [edges, handleDeleteEdge]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=${activeTheme.fontFamily.replace(/ /g, '+')}:wght@400;600;700&display=swap');

        :root {
          --custom-font: '${activeTheme.fontFamily}', sans-serif;
          --canvas-bg: ${activeTheme.canvasBg};
          --text-bg: ${activeTheme.textBg};
          --text-color: ${activeTheme.textColor};
          --decision-color: ${activeTheme.decisionColor};
          --note-color: ${activeTheme.noteColor};
          --outcome-good-color: ${activeTheme.outcomeGoodColor};
          --outcome-bad-color: ${activeTheme.outcomeBadColor};
          --outcome-neutral-color: ${activeTheme.outcomeNeutralColor};
        }

        .custom-font-family {
          font-family: var(--custom-font) !important;
        }

        /* Node Global Settings */
        .react-flow__node {
          font-family: var(--custom-font);
        }
      `}</style>

      <div className="w-full h-screen relative transition-colors custom-font-family" style={{ backgroundColor: 'var(--canvas-bg)' }} ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodesWithCallbacks}
          edges={edgesWithCallbacks}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onConnectStart={onConnectStart}
          onConnectEnd={onConnectEnd}
          onPaneClick={onPaneClick}
          onNodeDragStart={onNodeDragStart}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          colorMode={isDarkMode ? 'dark' : 'light'}
          fitView
          className=""
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
              <div className="flex gap-1">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className={`p-1 rounded-full transition ${showSettings ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 bg-gray-100 dark:bg-gray-700'}`}
                  title="Visual Settings"
                >
                  <Settings size={14} />
                </button>
                <button
                  onClick={toggleTheme}
                  className="p-1 rounded-full text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 bg-gray-100 dark:bg-gray-700 transition"
                  title="Toggle Dark Mode"
                >
                  {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
                </button>
              </div>
            </div>
            <button onClick={() => addNode('decision')} className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded text-sm hover:bg-blue-100 dark:hover:bg-blue-900/50 transition text-left" style={{ borderColor: 'var(--decision-color)', color: 'var(--decision-color)' }}>Decision</button>
            <button onClick={() => addNode('text')} className="px-3 py-1.5 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800 rounded text-sm hover:bg-yellow-100 dark:hover:bg-yellow-900/50 transition text-left" style={{ borderColor: 'var(--note-color)', color: 'var(--note-color)' }}>Note / Event</button>
            <button onClick={() => addNode('outcome')} className="px-3 py-1.5 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 rounded text-sm hover:bg-purple-100 dark:hover:bg-purple-900/50 transition text-left" style={{ borderColor: 'var(--outcome-neutral-color)', color: 'var(--outcome-neutral-color)' }}>Outcome</button>

            <hr className="my-1 border-gray-100 dark:border-gray-700" />

            <h3 className="font-bold text-sm mb-1 text-gray-700 dark:text-gray-200">Actions</h3>

            <div className="flex gap-2">
              <button
                onClick={undo}
                disabled={past.length === 0}
                className="flex-1 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 rounded text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition flex justify-center items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Undo (Ctrl+Z)"
              >
                <Undo2 size={14} />
              </button>
              <button
                onClick={redo}
                disabled={future.length === 0}
                className="flex-1 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 rounded text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition flex justify-center items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Redo (Ctrl+Shift+Z)"
              >
                <Redo2 size={14} />
              </button>
            </div>

            <button onClick={() => onLayout('TB')} className="w-full px-3 py-1.5 bg-gray-800 dark:bg-gray-700 text-white rounded text-sm hover:bg-gray-700 dark:hover:bg-gray-600 transition">Auto Layout Tree</button>
            <button onClick={centerOnStart} className="w-full px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded text-sm hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition flex items-center justify-center gap-2">
              <LocateFixed size={14} /> Locate Start
            </button>

            <hr className="my-1 border-gray-100 dark:border-gray-700" />
            <button onClick={startFromScratch} className="w-full px-3 py-1.5 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded text-sm hover:bg-red-100 dark:hover:bg-red-900/50 transition flex items-center justify-center gap-2 font-semibold">
              <FilePlus size={14} /> New Flow
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

          {showSettings && (
            <Panel position="top-left" className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col gap-3 w-64 max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-gray-700">
                <h3 className="font-bold text-sm text-gray-800 dark:text-gray-100">Visual Settings ({isDarkMode ? 'Dark' : 'Light'})</h3>
                <button onClick={() => setShowSettings(false)} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100"><XIcon size={16} /></button>
              </div>

              <div className="flex flex-col gap-1">
                <SettingRow label="Google Font" settingKey="fontFamily" type="text" list="fonts" activeTheme={activeTheme} activeDefaultTheme={activeDefaultTheme} updateActiveTheme={updateActiveTheme} resetSetting={resetSetting} />
                <datalist id="fonts">
                  {popularFonts.map(f => <option key={f} value={f} />)}
                </datalist>
              </div>

              <div className="flex flex-col gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                <SettingRow label="Canvas Bg" settingKey="canvasBg" activeTheme={activeTheme} activeDefaultTheme={activeDefaultTheme} updateActiveTheme={updateActiveTheme} resetSetting={resetSetting} />
                <SettingRow label="Text Box Bg" settingKey="textBg" activeTheme={activeTheme} activeDefaultTheme={activeDefaultTheme} updateActiveTheme={updateActiveTheme} resetSetting={resetSetting} />
                <SettingRow label="Text Color" settingKey="textColor" activeTheme={activeTheme} activeDefaultTheme={activeDefaultTheme} updateActiveTheme={updateActiveTheme} resetSetting={resetSetting} />
              </div>

              <div className="flex flex-col gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                <SettingRow label="Decision Node" settingKey="decisionColor" activeTheme={activeTheme} activeDefaultTheme={activeDefaultTheme} updateActiveTheme={updateActiveTheme} resetSetting={resetSetting} />
                <SettingRow label="Note Node" settingKey="noteColor" activeTheme={activeTheme} activeDefaultTheme={activeDefaultTheme} updateActiveTheme={updateActiveTheme} resetSetting={resetSetting} />
                <SettingRow label="Outcome (Good)" settingKey="outcomeGoodColor" activeTheme={activeTheme} activeDefaultTheme={activeDefaultTheme} updateActiveTheme={updateActiveTheme} resetSetting={resetSetting} />
                <SettingRow label="Outcome (Neutral)" settingKey="outcomeNeutralColor" activeTheme={activeTheme} activeDefaultTheme={activeDefaultTheme} updateActiveTheme={updateActiveTheme} resetSetting={resetSetting} />
                <SettingRow label="Outcome (Bad)" settingKey="outcomeBadColor" activeTheme={activeTheme} activeDefaultTheme={activeDefaultTheme} updateActiveTheme={updateActiveTheme} resetSetting={resetSetting} />
              </div>

              <div className="pt-2 border-t border-gray-100 dark:border-gray-700 mt-1">
                <button
                  onClick={resetAllSettings}
                  className="w-full py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded border border-red-200 dark:border-red-800 transition"
                >
                  Reset All Settings to Defaults
                </button>
              </div>
            </Panel>
          )}

        </ReactFlow>

        {menu.show && (
          <div
            className="absolute bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl rounded-md py-2 w-48 z-50 flex flex-col"
            style={{ top: menu.y, left: menu.x }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-3 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Create connection to...</div>
            <button className="px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200" onClick={() => addNode('decision', menu.x, menu.y, menu.params)}>Decision Node</button>
            <button className="px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200" onClick={() => addNode('text', menu.x, menu.y, menu.params)}>Note / Event Node</button>
            <button className="px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200" onClick={() => addNode('outcome', menu.x, menu.y, menu.params)}>Outcome Node</button>
          </div>
        )}
      </div>
    </>
  );
}

export default function Editor() {
  return (
    <ReactFlowProvider>
      <FlowEditor />
    </ReactFlowProvider>
  );
}
