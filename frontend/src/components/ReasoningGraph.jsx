import React, { useEffect } from 'react';
import ReactFlow, { Background, Controls, useNodesState, useEdgesState, MarkerType, Handle, Position } from 'reactflow';
import 'reactflow/dist/style.css';

const NODE_COLORS = {
  1: 'bg-orange-100 border-orange-400 text-orange-900',  // Mutation
  2: 'bg-blue-100 border-blue-400 text-blue-900',        // Gene
  3: 'bg-purple-100 border-purple-400 text-purple-900',    // Mechanism
  4: 'bg-green-100 border-green-400 text-green-900',       // Therapy
  '4b': 'bg-red-100 border-red-400 text-red-900',          // Skeptic Review
  '4c': 'bg-amber-100 border-amber-400 text-amber-900',    // Consensus
  5: 'bg-slate-100 border-slate-400 text-slate-900',       // Evidence
  6: 'bg-teal-100 border-teal-400 text-teal-900',          // Clinical Trials
};

const CustomNode = ({ data }) => {
  const colorClass = NODE_COLORS[data.step] || 'bg-gray-100 border-gray-400';
  
  return (
    <div className={`px-4 py-3 rounded-lg border-2 min-w-[200px] text-center ${colorClass} relative`}>
      <Handle type="target" position={Position.Top} className="opacity-0 w-1 h-1" />
      <div className="text-xs font-bold uppercase tracking-wider opacity-60 mb-1">Step {data.step}</div>
      <div className="font-semibold">{data.label}</div>
      <Handle type="source" position={Position.Bottom} className="opacity-0 w-1 h-1" />
    </div>
  );
};

const nodeTypes = {
  custom: CustomNode,
};

export default function ReasoningGraph({ chain, onNodeClick }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    if (!chain || chain.length === 0) {
      setNodes([]);
      setEdges([]);
      return;
    }

    const allNodes = chain.map((item, index) => ({
      id: `node-${item.step}`,
      type: 'custom',
      position: { x: 250, y: index * 120 + 50 },
      data: item,
    }));

    const allEdges = [];
    for (let i = 0; i < chain.length - 1; i++) {
      allEdges.push({
        id: `edge-${chain[i].step}-${chain[i+1].step}`,
        source: `node-${chain[i].step}`,
        target: `node-${chain[i+1].step}`,
        animated: true,
        style: { stroke: '#94a3b8', strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#94a3b8',
        },
      });
    }

    setNodes([]);
    setEdges([]);

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < chain.length) {
        setNodes(allNodes.slice(0, currentStep + 1));
        if (currentStep > 0) {
          setEdges(allEdges.slice(0, currentStep));
        }
        currentStep++;
      } else {
        clearInterval(interval);
      }
    }, 800);

    return () => clearInterval(interval);
  }, [chain]);

  return (
    <div className="w-full h-full bg-slate-50/50 rounded-xl border border-slate-200 overflow-hidden relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        onNodeClick={(_, node) => onNodeClick(node.data)}
        fitView
        attributionPosition="bottom-right"
      >
        <Background color="#e2e8f0" gap={16} />
        <Controls />
      </ReactFlow>
      {!chain?.length && (
        <div className="absolute inset-0 flex items-center justify-center text-slate-400 font-medium">
          Enter a mutation to generate reasoning graph
        </div>
      )}
    </div>
  );
}
