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
import { Download, Upload, LocateFixed, Moon, Sun, Settings, X as XIcon, RotateCcw, Undo2, Redo2, FilePlus, Plus, EyeOff, Trash2, Waypoints, EyeClosed, List, FolderOpen, Calendar, User, FileText } from 'lucide-react';
import debounce from 'lodash.debounce';

import { DecisionNode, TextNode, OutcomeNode, CustomEdge, DecorativeNode } from './nodes';
import { getLayoutedElements } from '../utils/layout';
import { ThemeSettings, defaultLightTheme, defaultDarkTheme } from '../types';

const nodeTypes = {
  decision: DecisionNode,
  text: TextNode,
  outcome: OutcomeNode,
  image: DecorativeNode,
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
          value={activeTheme[settingKey] || ''}
          onChange={(e) => updateActiveTheme(settingKey, e.target.value)}
          className={type === 'color' ? "w-8 h-8 rounded cursor-pointer border-0 p-0" : "w-28 text-xs p-1 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-gray-100"}
        />


      </div>
    </div>
  );
};

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
    delete cleanData.onMediaUrlChange;
    delete cleanData.isHighlighted;

    const cleanNode = { ...n, data: cleanData };
    if (cleanNode.measured) {
        delete cleanNode.measured;
    }

    return cleanNode;
  });
};

const MAX_HISTORY = 30;

function FlowEditor() {
  const { fitView, screenToFlowPosition, setCenter } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('brain-map-theme') === 'dark';
    }
    return false;
  });

  const [lightTheme, setLightTheme] = useState<ThemeSettings>(defaultLightTheme);
  const [darkTheme, setDarkTheme] = useState<ThemeSettings>(defaultDarkTheme);
  const [showSettings, setShowSettings] = useState(false);
  const [showFlowBrowser, setShowFlowBrowser] = useState(false);
    type FlowItem = {
    filename: string;
    title: string;
    author: string;
    timestamp: string | null;
    nodeCount: number;
    canvasBg: string | null;
    logoUrl: string | null;
  };
  const [flowsList, setFlowsList] = useState<FlowItem[]>([]);
  const [flowsLoading, setFlowsLoading] = useState(false);
  const [flowsSearch, setFlowsSearch] = useState('');
  const [flowsSort, setFlowsSort] = useState<'title' | 'date' | 'author' | 'nodes'>('date');
  const [showEndings, setShowEndings] = useState(false);
  const [flowTitle, setFlowTitle] = useState<string>('');
  const [flowAuthor, setFlowAuthor] = useState<string>('');
  const [syncSharedSettings, setSyncSharedSettings] = useState(true);

  const activeTheme = isDarkMode ? darkTheme : lightTheme;
  const activeDefaultTheme = isDarkMode ? defaultDarkTheme : defaultLightTheme;

  const [isLoaded, setIsLoaded] = useState(false);

  type MenuState = {
    show: boolean;
    x: number;
    y: number;
    type: 'create' | 'node';
    connectionParams?: { source: string; sourceHandle?: string };
    targetNode?: Node;
  };
  const [menu, setMenu] = useState<MenuState>({ show: false, x: 0, y: 0, type: 'create' });
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  const isConnectingRef = useRef(false);

  const [past, setPast] = useState<{nodes: Node[], edges: Edge[]}[]>([]);
  const [future, setFuture] = useState<{nodes: Node[], edges: Edge[]}[]>([]);

  const fetchFlows = async () => {
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
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchFlows();
    }
  }, [showFlowBrowser]);
  const [highlightedTargetId, setHighlightedTargetId] = useState<string | null>(null);

  // Spoiler Mode State
  const [isSpoilerMode, setIsSpoilerMode] = useState(false);
  const [revealedNodeIds, setRevealedNodeIds] = useState<Set<string>>(new Set());

  const takeSnapshot = useCallback(() => {
    setPast((prev) => {
      const currentClean = { nodes: getCleanNodes(nodes), edges };
      const newPast = [...prev, currentClean];
      if (newPast.length > MAX_HISTORY) {
        newPast.shift();
      }
      return newPast;
    });
    setFuture([]);
  }, [nodes, edges]);

  const debouncedSnapshotRef = useRef(debounce(takeSnapshot, 1000));

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
    setHighlightedTargetId(null);
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
    setHighlightedTargetId(null);
  }, [future, nodes, edges, setNodes, setEdges]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
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
          if (flow.settings.light) setTimeout(() => setLightTheme({ ...defaultLightTheme, ...flow.settings.light }), 0);
          if (flow.settings.dark) setTimeout(() => setDarkTheme({ ...defaultDarkTheme, ...flow.settings.dark }), 0);
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
      setHighlightedTargetId(null);
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
    if (highlightedTargetId === nodeId) setHighlightedTargetId(null);
  }, [setNodes, setEdges, triggerSnapshot, highlightedTargetId]);

  const { highlightedNodeIds, highlightedEdgeIds } = useMemo(() => {
    const nodeSet = new Set<string>();
    const edgeSet = new Set<string>();

    if (!highlightedTargetId) return { highlightedNodeIds: nodeSet, highlightedEdgeIds: edgeSet };

    const queue = [highlightedTargetId];
    nodeSet.add(highlightedTargetId);

    while (queue.length > 0) {
      const current = queue.shift()!;
      edges.forEach(edge => {
        if (edge.target === current) {
          edgeSet.add(edge.id);
          if (!nodeSet.has(edge.source)) {
            nodeSet.add(edge.source);
            queue.push(edge.source);
          }
        }
      });
    }

    return { highlightedNodeIds: nodeSet, highlightedEdgeIds: edgeSet };
  }, [edges, highlightedTargetId]);

  const nodesWithCallbacks = useMemo(() => {
    return nodes.map(node => {
      const isHighlighted = highlightedNodeIds.has(node.id);
      const isBlurred = isSpoilerMode && node.id !== 'start' && !revealedNodeIds.has(node.id);
      const data: Record<string, unknown> = { ...node.data, onDelete: deleteNode, isHighlighted, isBlurred };

      if (node.type === 'decision') {
        data.onChoicesChange = (id: string, choices: string[]) => {
          updateNodeData(id, { choices }, true);
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
        data.onPromptChange = (id: string, prompt: string) => updateNodeData(id, { prompt }, false);
        data.onTextHiddenChange = (id: string, isTextHidden: boolean) => updateNodeData(id, { isTextHidden }, true);
      } else if (node.type === 'text') {
        data.onContentChange = (id: string, content: string) => updateNodeData(id, { content }, false);
        data.onMediaUrlChange = (id: string, mediaUrl: string) => updateNodeData(id, { mediaUrl }, false);
        data.onTextHiddenChange = (id: string, isTextHidden: boolean) => updateNodeData(id, { isTextHidden }, true);
      } else if (node.type === 'outcome') {
        data.onOutcomeChange = (id: string, outcome: string) => updateNodeData(id, { outcome }, false);
        data.onTypeChange = (id: string, type: string) => updateNodeData(id, { type }, true);
      }

      return { ...node, data };
    });
  }, [nodes, updateNodeData, deleteNode, setEdges, highlightedNodeIds, isSpoilerMode, revealedNodeIds]);

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
            type: 'create',
            connectionParams: {
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

  const onPaneContextMenu = useCallback(
    (event: MouseEvent | React.MouseEvent) => {
      if (event.shiftKey) return;
      event.preventDefault();

      if (reactFlowWrapper.current) {
        const { top, left } = reactFlowWrapper.current.getBoundingClientRect();
        setMenu({
          show: true,
          x: event.clientX - left,
          y: event.clientY - top,
          type: 'create',
        });
      }
    },
    []
  );

  const onNodeContextMenu = useCallback(
    (event: MouseEvent | React.MouseEvent, node: Node) => {
      if (event.shiftKey) return;
      event.preventDefault();

      if (reactFlowWrapper.current) {
        const { top, left } = reactFlowWrapper.current.getBoundingClientRect();
        setMenu({
          show: true,
          x: event.clientX - left,
          y: event.clientY - top,
          type: 'node',
          targetNode: node
        });
      }
    },
    []
  );

  const onPaneClick = useCallback(() => {
    if (isConnectingRef.current) return;
    setMenu(prev => ({ ...prev, show: false }));
    setHighlightedTargetId(null);
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

  const addNode = (type: 'decision' | 'text' | 'outcome' | 'image', menuX?: number, menuY?: number, connectionParams?: {source: string, sourceHandle?: string}) => {
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
    setMenu(prev => ({ ...prev, show: false }));
  };

  const handleMenuNodeAction = (action: string) => {
    if (!menu.targetNode) return;

    const node = menu.targetNode;
    const id = node.id;

    switch (action) {
      case 'add_choice':
        if (node.type === 'decision') {
          const freshNode = nodes.find(n => n.id === id);
          if (freshNode) {
             const currentChoices = (freshNode.data.choices as string[]) || [];
             const newChoices = [...currentChoices, `Choice ${currentChoices.length + 1}`];
             updateNodeData(id, { choices: newChoices }, true);
          }
        }
        break;
      case 'toggle_text':
        const freshNodeForText = nodes.find(n => n.id === id);
        if (freshNodeForText) {
          const isHidden = !!freshNodeForText.data.isTextHidden;
          updateNodeData(id, { isTextHidden: !isHidden }, true);
        }
        break;
      case 'highlight_path':
        setHighlightedTargetId(id);
        break;
      case 'clear_highlight':
        setHighlightedTargetId(null);
        break;
      case 'delete':
        deleteNode(id);
        break;
    }
    setMenu(prev => ({ ...prev, show: false }));
  };

  const centerOnStart = () => {
    const startNode = nodes.find(n => n.id === 'start') || nodes[0];
    if (startNode) {
      fitView({ nodes: [{ id: startNode.id }], duration: 800, padding: 3 });
    }
  };

  const onExport = () => {
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
  };

  const loadFlowFromUrl = async (filename: string) => {
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
  };

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    if (isSpoilerMode && node.id !== 'start' && !revealedNodeIds.has(node.id)) {
      setRevealedNodeIds(prev => new Set([...prev, node.id]));
    }
  }, [isSpoilerMode, revealedNodeIds]);

  const onNodeDragStart = useCallback(() => {
    triggerSnapshot(true);
  }, [triggerSnapshot]);

  const handleDeleteEdge = useCallback((edgeId: string) => {
    triggerSnapshot(true);
    setEdges((eds) => eds.filter((e) => e.id !== edgeId));
  }, [setEdges, triggerSnapshot]);

  const edgesWithCallbacks = useMemo(() => {
    return edges.map(edge => {
      // Blur the edge if spoiler mode is on, and its source node hasn't been revealed yet.
      const isBlurred = isSpoilerMode && edge.source !== 'start' && !revealedNodeIds.has(edge.source);
      return {
        ...edge,
        data: {
          ...edge.data,
          onDelete: handleDeleteEdge,
          isHighlighted: highlightedEdgeIds.has(edge.id),
          isBlurred
        }
      };
    });
  }, [edges, handleDeleteEdge, highlightedEdgeIds, isSpoilerMode, revealedNodeIds]);

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
          --path-highlight-color: ${activeTheme.pathHighlightColor || '#22d3ee'};
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
          onPaneContextMenu={onPaneContextMenu}
          onNodeContextMenu={onNodeContextMenu}
          onNodeClick={onNodeClick}
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

          {/* Decorative Logo Overlay */}
          {activeTheme.logoUrl && (
             <Panel position="top-left" className="pointer-events-none opacity-90 m-6">
                <img
                  src={activeTheme.logoUrl}
                  alt="VN Logo"
                  className="max-h-32 object-contain drop-shadow-xl"
                  onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                />
             </Panel>
          )}

          <Panel position="top-right" className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 flex flex-col gap-2 w-48 transition-colors">
            <div className="flex justify-between items-center mb-1">
              <h3 className="font-bold text-sm text-gray-700 dark:text-gray-200">Add Nodes</h3>
              <div className="flex gap-1">
                <button
                  onClick={() => { setShowEndings(!showEndings); setShowSettings(false); }}
                  className={`p-1 rounded-full transition ${showEndings ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 bg-gray-100 dark:bg-gray-700'}`}
                  title="View Endings"
                >
                  <List size={14} />
                </button>
                <button
                  onClick={() => { setShowSettings(!showSettings); setShowEndings(false); }}
                  className={`p-1 rounded-full transition ${showSettings ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 bg-gray-100 dark:bg-gray-700'}`}
                  title="Visual Settings"
                >
                  <Settings size={14} />
                </button>
                <button
                  onClick={() => {
                     setIsSpoilerMode(!isSpoilerMode);
                     if (isSpoilerMode) setRevealedNodeIds(new Set()); // Reset on disable
                  }}
                  className={`p-1 rounded-full transition ${isSpoilerMode ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 bg-gray-100 dark:bg-gray-700'}`}
                  title="Toggle Spoiler Mode"
                >
                  <EyeClosed size={14} />
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
               <button
                  onClick={() => setShowFlowBrowser(true)}
                  title="Browse Flows"
                  className="flex-1 flex justify-center items-center py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition"
               >
                  <FolderOpen size={16} />
               </button>
               <button onClick={onExport} title="Export JSON" className="flex-1 flex justify-center items-center py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                  <Download size={16} />
               </button>
               <button onClick={() => fileInputRef.current?.click()} title="Import JSON" className="flex-1 flex justify-center items-center py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                  <Upload size={16} />
               </button>
               <input type="file" ref={fileInputRef} onChange={onImport} accept=".json" className="hidden" />
            </div>
          </Panel>


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
                    const outcomeType = node.data.type as 'good' | 'bad' | 'neutral' || 'neutral';
                    const isRevealed = revealedNodeIds.has(node.id);
                    const isBlurred = isSpoilerMode && !isRevealed;

                    let bgClass = 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200';
                    if (!isBlurred) {
                      if (outcomeType === 'good') bgClass = 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200';
                      if (outcomeType === 'bad') bgClass = 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200';
                    }

                    const outcomeText = node.data.outcome as string;
                    let displayName = outcomeText;
                    if (!displayName || displayName === 'Ending Name') {
                      if (outcomeType === 'good') displayName = 'Good Ending';
                      else if (outcomeType === 'bad') displayName = 'Bad Ending';
                      else displayName = 'Neutral Ending';
                    }

                    return (
                      <div key={node.id} className={`flex flex-col gap-2 p-2 rounded border ${bgClass}`}>
                        <div className="flex items-center justify-between">
                           <span className={`text-sm font-semibold truncate flex-1 ${isBlurred ? 'blur-sm select-none' : ''}`}>
                             {displayName}
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
                               if (node.position) {
                                 setCenter(node.position.x + 100, node.position.y + 100, { zoom: 1, duration: 800 });
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

          {showSettings && (
            <Panel position="top-right" className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col gap-3 w-64 max-h-[80vh] overflow-y-auto mt-2" style={{ top: 'auto', bottom: 'auto', left: 'auto', right: '14rem' }}>
              <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-gray-700">
                <h3 className="font-bold text-sm text-gray-800 dark:text-gray-100">Visual Settings ({isDarkMode ? 'Dark' : 'Light'})</h3>
                <button onClick={() => setShowSettings(false)} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100"><XIcon size={16} /></button>
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100 dark:border-gray-700">
                  <input
                    type="checkbox"
                    id="syncSettings"
                    checked={syncSharedSettings}
                    onChange={(e) => setSyncSharedSettings(e.target.checked)}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="syncSettings" className="text-xs text-gray-600 dark:text-gray-300 select-none cursor-pointer">
                    Sync Logo & Font between themes
                  </label>
                </div>
                <SettingRow label="Logo URL" settingKey="logoUrl" type="text" activeTheme={activeTheme} activeDefaultTheme={activeDefaultTheme} updateActiveTheme={updateActiveTheme} resetSetting={resetSetting} />
                <SettingRow label="Google Font" settingKey="fontFamily" type="text" list="fonts" activeTheme={activeTheme} activeDefaultTheme={activeDefaultTheme} updateActiveTheme={updateActiveTheme} resetSetting={resetSetting} />
                <datalist id="fonts">
                  {popularFonts.map(f => <option key={f} value={f} />)}
                </datalist>
              </div>

              <div className="flex flex-col gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                <div className="flex justify-between items-center group/row">
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-300 w-16">Title</label>
                  <input type="text" value={flowTitle} onChange={(e) => setFlowTitle(e.target.value)} placeholder="Untitled Flow" className="w-40 text-xs p-1 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-gray-100" />
                </div>
                <div className="flex justify-between items-center group/row">
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-300 w-16">Author</label>
                  <input type="text" value={flowAuthor} onChange={(e) => setFlowAuthor(e.target.value)} placeholder="Anonymous" className="w-40 text-xs p-1 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-gray-100" />
                </div>
              </div>
              <div className="flex flex-col gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                <SettingRow label="Canvas Bg" settingKey="canvasBg" activeTheme={activeTheme} activeDefaultTheme={activeDefaultTheme} updateActiveTheme={updateActiveTheme} resetSetting={resetSetting} />
                <SettingRow label="Text Box Bg" settingKey="textBg" activeTheme={activeTheme} activeDefaultTheme={activeDefaultTheme} updateActiveTheme={updateActiveTheme} resetSetting={resetSetting} />
                <SettingRow label="Text Color" settingKey="textColor" activeTheme={activeTheme} activeDefaultTheme={activeDefaultTheme} updateActiveTheme={updateActiveTheme} resetSetting={resetSetting} />
                <SettingRow label="Path Glow" settingKey="pathHighlightColor" activeTheme={activeTheme} activeDefaultTheme={activeDefaultTheme} updateActiveTheme={updateActiveTheme} resetSetting={resetSetting} />
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
                  onChange={(e) => setFlowsSort(e.target.value as 'title' | 'date' | 'author' | 'nodes')}
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
                            className="h-32 w-full border-b border-gray-100 dark:border-gray-700 transition-colors flex items-center justify-center relative overflow-hidden"
                            style={{ backgroundColor: flow.canvasBg || '#f3f4f6' }}
                          >
                            {flow.logoUrl && (
                               <img
                                 src={flow.logoUrl}
                                 alt="Flow Logo"
                                 className="max-h-24 max-w-[80%] object-contain drop-shadow-md z-10"
                                 onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                               />
                            )}
                          </div>
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
        {menu.show && (
          <div
            className="absolute bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl rounded-md py-2 z-50 flex flex-col min-w-40"
            style={{ top: menu.y, left: menu.x }}
            onClick={(e) => e.stopPropagation()}
          >
            {menu.type === 'create' ? (
              <>
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
              </>
            ) : (
              <>
                <div className="px-3 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase border-b border-gray-100 dark:border-gray-700 mb-1">Node Actions</div>
                {menu.targetNode?.type === 'decision' && (
                  <button className="flex items-center gap-2 px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-blue-600 dark:text-blue-400" onClick={() => handleMenuNodeAction('add_choice')}>
                    <Plus size={14} /> Add Choice
                  </button>
                )}

                {(menu.targetNode?.type === 'decision' || (menu.targetNode?.type === 'text' && menu.targetNode.data?.mediaUrl)) && (
                  <button className="flex items-center gap-2 px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200" onClick={() => handleMenuNodeAction('toggle_text')}>
                    <EyeOff size={14} /> Toggle Text Visibility
                  </button>
                )}

                {highlightedTargetId === menu.targetNode?.id ? (
                  <button className="flex items-center gap-2 px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-cyan-600 dark:text-cyan-400" onClick={() => handleMenuNodeAction('clear_highlight')}>
                    <Waypoints size={14} /> Hide Path
                  </button>
                ) : (
                  <button className="flex items-center gap-2 px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-cyan-600 dark:text-cyan-400" onClick={() => handleMenuNodeAction('highlight_path')}>
                    <Waypoints size={14} /> Show Path to Node
                  </button>
                )}

                <button className="flex items-center gap-2 px-4 py-2 text-sm text-left hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 mt-1 border-t border-gray-100 dark:border-gray-700 pt-2" onClick={() => handleMenuNodeAction('delete')}>
                  <Trash2 size={14} /> Delete Node
                </button>
              </>
            )}
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
