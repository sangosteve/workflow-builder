'use client'
import React, { useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  type Node,
  type Edge,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import ButtonEdge from '@/components/flow/button-edge';
import '@xyflow/react/dist/style.css';
import NodeButtonHandle from '@/components/flow/node-button-handle';
import CustomBaseNode from '@/components/flow/CustomBaseNode';

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'custombase',
    data: { label: 'Start Node' },
    position: { x: 0, y: 0 },
  },
  {
    id: '2',
    type: 'custombase',
    data: { label: 'Second Node' },
    position: { x: 0, y: 0 },
  },
  {
    id: '3',
    type: 'buttonhandle',
    data: { label: 'Third Node' }, // we will extend this with onAdd
    position: { x: 0, y: 0 },
  },
];

const initialEdges: Edge[] = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    type: 'buttonedge',
  },
  {
    id: 'e2-3',
    source: '2',
    target: '3',
    type: 'buttonedge',
  },
];

const edgeTypes = {
  buttonedge: ButtonEdge,
};

const nodeTypes = {
  buttonhandle: NodeButtonHandle,
  custombase: CustomBaseNode,
};

//Helper Functions:
const getAutoPositionedNodes = (nodes: Node[]): Node[] => {
  const baseX = 100;
  const spacingY = 200;

  return nodes.map((node, index) => ({
    ...node,
    position: { x: baseX, y: 100 + index * spacingY },
  }));
};

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(getAutoPositionedNodes(initialNodes));
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const handleAddNode = useCallback(
    (sourceId: string) => {
      const newNodeId = `${nodes.length + 1}`;
      const newNode: Node = {
        id: newNodeId,
        type: 'buttonhandle',
        position: { x: 100, y: 100 + nodes.length * 200 },
        data: {
          label: `Node ${newNodeId}`,
          onAdd: handleAddNode,
        },
      };

      const newEdge: Edge = {
        id: `e${sourceId}-${newNodeId}`,
        source: sourceId,
        target: newNodeId,
        type: 'buttonedge',
      };

      setNodes((prevNodes) => {
        const updatedNodes = [
          ...prevNodes.map((node) =>
            node.id === sourceId && node.type === 'buttonhandle'
              ? { ...node, type: 'custombase' }
              : node
          ),
          newNode,
        ];

        return getAutoPositionedNodes(updatedNodes);
      });

      setEdges((eds) => [...eds, newEdge]);
    },
    [nodes.length, setNodes, setEdges]
  );

  const handleRemoveNode = useCallback(
    (nodeId: string) => {
      console.log('Removing node:', nodeId);

      setEdges((prevEdges) => {
        // Find all edges connected to the node being removed
        const incoming = prevEdges.find((e) => e.target === nodeId);
        const outgoing = prevEdges.find((e) => e.source === nodeId);

        // Remove edges that include the node
        const filteredEdges = prevEdges.filter(
          (e) => e.source !== nodeId && e.target !== nodeId
        );

        // If both incoming and outgoing exist, connect them directly
        if (incoming && outgoing) {
          const newEdge: Edge = {
            id: `e${incoming.source}-${outgoing.target}`,
            source: incoming.source,
            target: outgoing.target,
            type: 'buttonedge',
          };
          return [...filteredEdges, newEdge];
        }

        return filteredEdges;
      });

      setNodes((prevNodes) => {
        const filtered = prevNodes.filter((node) => node.id !== nodeId);
        return getAutoPositionedNodes(filtered);
      });
    },
    [setNodes, setEdges]
  );



  // Inject the onAdd into all buttonhandle nodes
  const enrichedNodes = nodes.map((node) => {
    if (node.type === 'buttonhandle' || node.type === 'custombase') {
      return {
        ...node,
        data: {
          ...node.data,
          onAdd: handleAddNode,
          onRemove: handleRemoveNode, // Pass the remove function to the node
        },
      };
    }
    return node;
  });

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow
        nodes={enrichedNodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        edgeTypes={edgeTypes}
        nodeTypes={nodeTypes}
        nodesDraggable={false} // 🚫 disables dragging nodes
        nodesConnectable={false} // 🚫 disables creating new edges
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
