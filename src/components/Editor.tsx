"use client";

import React, { useCallback, useMemo, useRef } from 'react';
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
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { v4 as uuidv4 } from 'uuid';
import { Download, Upload } from 'lucide-react';

import { DecisionNode, TextNode, OutcomeNode } from './nodes';
import { getLayoutedElements } from '../utils/layout';

const nodeTypes = {
  decision: DecisionNode,
  text: TextNode,
  outcome: OutcomeNode,
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
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update node data helpers
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

  // Inject update callbacks into node data
  const nodesWithCallbacks = useMemo(() => {
    return nodes.map(node => {
      // Create a shallow copy of data
      const data = { ...node.data };

      // Inject specific callbacks based on node type
      if (node.type === 'decision') {
        data.onChoicesChange = (id: string, choices: string[]) => updateNodeData(id, { choices });
        data.onPromptChange = (id: string, prompt: string) => updateNodeData(id, { prompt });
      } else if (node.type === 'text') {
        data.onContentChange = (id: string, content: string) => updateNodeData(id, { content });
      } else if (node.type === 'outcome') {
        data.onOutcomeChange = (id: string, outcome: string) => updateNodeData(id, { outcome });
        data.onTypeChange = (id: string, type: string) => updateNodeData(id, { type });
      }

      return { ...node, data };
    });
  }, [nodes, updateNodeData]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [setEdges],
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
      position: { x: window.innerWidth / 2 - 100, y: window.innerHeight / 2 - 100 }, // Centerish
      data:
        type === 'decision' ? { prompt: 'New Decision', choices: ['Choice A', 'Choice B'] } :
        type === 'text' ? { content: 'New Note' } :
        { outcome: 'New Ending', type: 'neutral' },
    };
    setNodes((nds) => nds.concat(newNode));
  };

  const onExport = () => {
    // We export nodes without the injected callbacks
    const cleanNodes = nodes.map(n => {
        const cleanData = { ...n.data };
        delete cleanData.onChoicesChange;
        delete cleanData.onPromptChange;
        delete cleanData.onContentChange;
        delete cleanData.onOutcomeChange;
        delete cleanData.onTypeChange;
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
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full h-screen relative bg-gray-50">
      <ReactFlow
        nodes={nodesWithCallbacks}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        className="bg-gray-50"
      >
        <Background gap={12} size={1} />
        <Controls />
        <MiniMap />

        <Panel position="top-right" className="bg-white p-4 rounded-lg shadow-md border border-gray-200 flex flex-col gap-2 w-48">
          <h3 className="font-bold text-sm mb-1 text-gray-700">Add Nodes</h3>
          <button onClick={() => addNode('decision')} className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-sm hover:bg-blue-100 transition text-left">Decision</button>
          <button onClick={() => addNode('text')} className="px-3 py-1.5 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded text-sm hover:bg-yellow-100 transition text-left">Note / Event</button>
          <button onClick={() => addNode('outcome')} className="px-3 py-1.5 bg-purple-50 text-purple-700 border border-purple-200 rounded text-sm hover:bg-purple-100 transition text-left">Outcome</button>

          <hr className="my-1 border-gray-100" />

          <h3 className="font-bold text-sm mb-1 text-gray-700">Actions</h3>
          <button onClick={() => onLayout('TB')} className="px-3 py-1.5 bg-gray-800 text-white rounded text-sm hover:bg-gray-700 transition">Auto Layout Tree</button>

          <div className="flex gap-2 mt-1">
             <button onClick={onExport} title="Export JSON" className="flex-1 flex justify-center items-center py-1.5 bg-gray-100 text-gray-700 border border-gray-200 rounded hover:bg-gray-200 transition">
                <Download size={16} />
             </button>
             <button onClick={() => fileInputRef.current?.click()} title="Import JSON" className="flex-1 flex justify-center items-center py-1.5 bg-gray-100 text-gray-700 border border-gray-200 rounded hover:bg-gray-200 transition">
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
