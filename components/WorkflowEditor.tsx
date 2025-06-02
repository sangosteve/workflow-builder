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
import { useWorkflowNodes, useWorkflowEdges, useCreateEdge, createEdge } from "@/lib/api-hooks";

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
    // isLoading: isLoadingNodes, 
    //error: nodesError 
  } = useWorkflowNodes(workflowId || '');

  const {
    data: dbEdges,
    // isLoading: isLoadingEdges, 
    //  error: edgesError 
  } = useWorkflowEdges(workflowId || '');

  // const createEdgeMutation = useCreateEdge();

  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [_isLoading, setIsLoading] = useState(!!workflowId);

  // Effect to transform DB nodes to ReactFlow nodes when data is loaded
  useEffect(() => {
    if (dbNodes && workflowId) {
      const reactFlowNodes = transformDbNodesToReactFlow(dbNodes);

      // Ensure all nodes have the workflowId in their data
      const nodesWithWorkflowId = reactFlowNodes.map(node => ({
        ...node,
        data: {
          ...node.data,
          workflowId
        }
      }));

      setNodes(nodesWithWorkflowId);
      setIsLoading(false);
    }
  }, [dbNodes, workflowId]);

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
    async (connection: Connection) => {
      // Add the edge to the React Flow instance first
      const newEdge = {
        ...connection,
        id: `e-${connection.source}-${connection.target}-${Date.now()}`,
        type: 'buttonedge',  // Use our custom edge type for all connections
      };

      const updatedEdges = addEdge(newEdge, edges);
      setEdges(updatedEdges);

      // If we have a workflowId, also create the edge in the database
      if (workflowId) {
        try {
          console.log("Creating edge in database with data:", {
            workflowId,
            sourceNodeId: connection.source,
            targetNodeId: connection.target,
          });

          await createEdge({
            workflowId,
            sourceNodeId: connection.source,
            targetNodeId: connection.target,
            label: "",  // Default empty label
            condition: ""  // Default empty condition
          });
        } catch (error) {
          console.error("Failed to create edge in database:", error);
          // Optionally revert the edge in the UI if the API call fails
          setEdges(edges);
        }
      }
    },
    [workflowId, edges, setEdges]
  );

  return (
    <ReactFlowProvider>
      <div className={className}>
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