"use client";
import React, { useCallback, useState, useEffect } from "react";
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
import { transformDbNodesToReactFlow, transformDbEdgesToReactFlow } from "@/lib/transformNodes";
import { useWorkflowNodes, useWorkflowEdges } from "@/lib/api-hooks";

interface WorkflowEditorProps {
  workflowId?: string;
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
  workflowId,
  initialNodes = [],
  initialEdges = [],
  onNodesChange: externalNodesChange,
  onEdgesChange: externalEdgesChange,
  readOnly = false,
  className = "h-[calc(100vh-64px)]", // Default height assuming a 64px navbar
}: WorkflowEditorProps) {
  // Use React Query hooks if workflowId is provided
  const { 
    data: dbNodes, 
    isLoading: isLoadingNodes, 
    error: nodesError 
  } = useWorkflowNodes(workflowId || '');
  
  const { 
    data: dbEdges, 
    isLoading: isLoadingEdges, 
    error: edgesError 
  } = useWorkflowEdges(workflowId || '');

  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [isLoading, setIsLoading] = useState(!!workflowId);

  // Effect to transform DB nodes to ReactFlow nodes when data is loaded
  useEffect(() => {
    if (dbNodes) {
      const reactFlowNodes = transformDbNodesToReactFlow(dbNodes);
      setNodes(reactFlowNodes);
      setIsLoading(false);
    }
  }, [dbNodes]);

  // Effect to transform DB edges to ReactFlow edges when data is loaded
  useEffect(() => {
    if (dbEdges) {
      const reactFlowEdges = transformDbEdgesToReactFlow(dbEdges);
      setEdges(reactFlowEdges);
    }
  }, [dbEdges]);

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

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <div className="text-lg">Loading workflow...</div>
      </div>
    );
  }

  // Show error state if there was an error loading nodes
  if (nodesError) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <div className="text-lg text-red-500">Error loading workflow nodes</div>
      </div>
    );
  }

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