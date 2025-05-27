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
  ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import ScheduledTriggerNode from "@/components/nodes/ScheduledTriggerNode";
import TriggerNode from "@/components/nodes/TriggerNode";
import ActionNode from "@/components/nodes/ActionNode";
import ConditionalNode from "@/components/nodes/ConditionalNode";
import ButtonEdge from "@/components/edges/ButtonEdge";

interface WorkflowEditorProps {
  initialNodes?: Node[];
  initialEdges?: Edge[];
  onNodesChange?: (nodes: Node[]) => void;
  onEdgesChange?: (edges: Edge[]) => void;
  readOnly?: boolean;
  className?: string;
}

const nodeTypes = {
  "scheduled-trigger": ScheduledTriggerNode,
  "trigger": TriggerNode,
  "action": ActionNode,
  "conditional": ConditionalNode,
};

const edgeTypes = {
  buttonedge: ButtonEdge,
};

export default function WorkflowEditor({
  initialNodes = [
    {
      id: "trigger-node",
      position: { x: 100, y: 50 },
      data: {
        label: "Instagram Trigger",
        triggerType: "follow"
      },
      type: "trigger",
    }
  ],
  initialEdges = [],
  onNodesChange: externalNodesChange,
  onEdgesChange: externalEdgesChange,
  readOnly = false,
  className = "h-[calc(100vh-64px)]", // Default height assuming a 64px navbar
}: WorkflowEditorProps) {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      const updatedNodes = applyNodeChanges(changes, nodes);
      setNodes(updatedNodes);
      if (externalNodesChange) {
        externalNodesChange(updatedNodes);
      }
    },
    [nodes, externalNodesChange]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      const updatedEdges = applyEdgeChanges(changes, edges);
      setEdges(updatedEdges);
      if (externalEdgesChange) {
        externalEdgesChange(updatedEdges);
      }
    },
    [edges, externalEdgesChange]
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      const updatedEdges = addEdge({
        ...connection,
        type: 'buttonedge'  // Use our custom edge type for all connections
      }, edges);
      setEdges(updatedEdges);
      if (externalEdgesChange) {
        externalEdgesChange(updatedEdges);
      }
    },
    [edges, externalEdgesChange]
  );

  return (
    <ReactFlowProvider>
      <div className={`w-full ${className}`}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          nodesDraggable={!readOnly}
          nodesConnectable={!readOnly}
          elementsSelectable={!readOnly}
        >
          <Controls position="top-left" />
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        </ReactFlow>
      </div>
    </ReactFlowProvider>
  );
}