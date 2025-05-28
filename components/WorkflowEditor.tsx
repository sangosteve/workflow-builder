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
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [isLoading, setIsLoading] = useState(!!workflowId);

  useEffect(() => {
    if (!workflowId) return;

    const fetchWorkflowData = async () => {
      setIsLoading(true);
      try {
        // Fetch nodes
        const nodesResponse = await fetch(`/api/workflows/${workflowId}/nodes`);
        if (!nodesResponse.ok) {
          throw new Error('Failed to fetch nodes');
        }
        const dbNodes = await nodesResponse.json();

        console.log('Fetched nodes:', dbNodes);

        // Transform database nodes to ReactFlow format
        const reactFlowNodes = transformDbNodesToReactFlow(dbNodes);

        // If no nodes were found, we might want to create a default one
        // But for now, just use what we got from the database
        setNodes(reactFlowNodes.length > 0 ? reactFlowNodes : []);

        // Fetch edges
        const edgesResponse = await fetch(`/api/workflows/${workflowId}/edges`);
        if (!edgesResponse.ok) {
          throw new Error('Failed to fetch edges');
        }
        const dbEdges = await edgesResponse.json();

        // Transform database edges to ReactFlow format
        const reactFlowEdges = transformDbEdgesToReactFlow(dbEdges);
        setEdges(reactFlowEdges);

      } catch (error) {
        console.error('Error fetching workflow data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkflowData();
  }, [workflowId]);

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
        type: 'buttonedge'
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
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-lg">Loading workflow...</div>
          </div>
        ) : (
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
        )}
      </div>
    </ReactFlowProvider>
  );
}