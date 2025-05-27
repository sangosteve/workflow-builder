"use client";
import React, { useCallback, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  applyNodeChanges,
  NodeChange,
  Node,
  BackgroundVariant,
  applyEdgeChanges,
  EdgeChange,
  addEdge,
  Connection,
  Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import ScheduledTriggerNode from "@/components/nodes/ScheduledTriggerNode";
import TriggerNode from "@/components/nodes/TriggerNode";
import ActionNode from "@/components/nodes/ActionNode";
import ConditionalNode from "@/components/nodes/ConditionalNode";
import ButtonEdge from "@/components/edges/ButtonEdge";

const initialNodes: Node[] = [
  {
    id: "trigger-node",
    position: { x: 100, y: 50 },
    data: {
      label: "Instagram Trigger",
      triggerType: "follow"
    },
    type: "trigger",
  }
];

const initialEdges: Edge[] = [];

const nodeTypes = {
  "scheduled-trigger": ScheduledTriggerNode,
  "trigger": TriggerNode,
  "action": ActionNode,
  "conditional": ConditionalNode,
};

const edgeTypes = {
  buttonedge: ButtonEdge,
};

export default function Page() {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState(initialEdges);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge({
      ...connection,
      type: 'buttonedge'  // Use our custom edge type for all connections
    }, eds)),
    []
  );

  return (
    <div className="w-screen h-screen relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
      >
        <Controls position="top-left" />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}