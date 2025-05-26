"use client"
import React, { useCallback } from "react";
import { Handle, Position, useReactFlow, useNodeId } from "@xyflow/react";
import { MoreVertical, UserRound, Plus } from "lucide-react";

interface ConditionalNodeProps {
  data: {
    label: string;
    status?: string;
    approvers?: Array<{
      id: string;
      name: string;
      avatar?: string;
      initial?: string;
      color?: string;
    }>;
  };
  isConnectable?: boolean;
  selected?: boolean;
}

export default function ConditionalNode({
  data,
  isConnectable = true,
  selected
}: ConditionalNodeProps) {
  const { setNodes, setEdges, getNode, getEdges } = useReactFlow();
  const id = useNodeId();

  // Check if this node has any outgoing connections for Yes and No branches
  const edges = getEdges();
  const hasYesConnection = edges.some(edge => edge.source === id && edge.sourceHandle === 'yes');
  const hasNoConnection = edges.some(edge => edge.source === id && edge.sourceHandle === 'no');

  const handleAddYesNode = useCallback(() => {
    if (!id) return;

    const parentNode = getNode(id);
    if (!parentNode) return;

    // Create a unique ID for the new node
    const newNodeId = `action-${Date.now()}`;

    // Add the new action node to the right (Yes branch)
    setNodes((nodes) => [
      ...nodes,
      {
        id: newNodeId,
        type: 'action',
        position: {
          x: parentNode.position.x + 160, // Position to the right for Yes branch
          y: parentNode.position.y + 120, // Position below the current node
        },
        data: {
          label: 'Yes Action',
          status: 'Action required'
        },
      },
    ]);

    // Add an edge connecting the current node to the new node
    setEdges((edges) => [
      ...edges,
      {
        id: `${id}-yes-${newNodeId}`,
        source: id,
        sourceHandle: 'yes',
        target: newNodeId,
        type: 'buttonedge', // Use our custom edge type
      },
    ]);
  }, [id, getNode, setNodes, setEdges]);

  const handleAddNoNode = useCallback(() => {
    if (!id) return;

    const parentNode = getNode(id);
    if (!parentNode) return;

    // Create a unique ID for the new node
    const newNodeId = `action-${Date.now()}`;

    // Add the new action node to the left (No branch)
    setNodes((nodes) => [
      ...nodes,
      {
        id: newNodeId,
        type: 'action',
        position: {
          x: parentNode.position.x - 160, // Position to the left for No branch
          y: parentNode.position.y + 120, // Position below the current node
        },
        data: {
          label: 'No Action',
          status: 'Action required'
        },
      },
    ]);

    // Add an edge connecting the current node to the new node
    setEdges((edges) => [
      ...edges,
      {
        id: `${id}-no-${newNodeId}`,
        source: id,
        sourceHandle: 'no',
        target: newNodeId,
        type: 'buttonedge', // Use our custom edge type
      },
    ]);
  }, [id, getNode, setNodes, setEdges]);

  // Default approvers if none provided
  const approvers = data.approvers || [
    { id: '1', name: 'Markus', initial: 'M', color: 'bg-purple-500' }
  ];

  return (
    <div className="relative">
      {/* Main node */}
      <div className={`bg-white rounded-lg shadow-sm p-3 border ${selected ? 'ring-2 ring-blue-300' : 'border-gray-200'}`} style={{ width: '240px' }}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="bg-gray-100 p-1 rounded">
              <UserRound className="text-gray-600 size-4" />
            </div>
            <div className="font-medium text-sm">{data.label || 'Approval stage'}</div>
          </div>
          <button className="text-gray-400 hover:text-gray-600 nodrag">
            <MoreVertical size={16} />
          </button>
        </div>
        
        {/* Approvers */}
        <div className="flex items-center gap-1">
          {approvers.map((approver, index) => (
            <div key={approver.id} className="flex items-center">
              <div className={`${approver.color || 'bg-purple-500'} text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium`}>
                {approver.initial || approver.name[0]}
              </div>
              {index === 0 && <span className="text-xs text-gray-500 ml-1">+1</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Branches container with connecting lines */}
      <div className="absolute left-0 right-0 flex justify-center" style={{ top: '100%', width: '100%' }}>
        {/* Center vertical line */}
        <div className="h-6 w-[1px] bg-gray-300"></div>
      </div>
      
      {/* Horizontal branch line */}
      <div className="absolute left-0 right-0" style={{ top: 'calc(100% + 6px)', width: '100%' }}>
        <div className="w-full h-[1px] bg-gray-300"></div>
      </div>
      
      {/* Branch labels and buttons */}
      <div className="absolute left-0 right-0 flex justify-between px-4" style={{ top: 'calc(100% + 8px)', width: '100%' }}>
        {/* YES branch */}
        <div className="flex flex-col items-center">
          <div className="bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1 rounded-md mb-6">
            YES
          </div>
          {!hasYesConnection && (
            <button
              className="bg-gray-100 rounded-full w-6 h-6 flex items-center justify-center shadow-sm hover:bg-gray-200 nodrag"
              onClick={handleAddYesNode}
            >
              <Plus className="text-gray-600 size-3" />
            </button>
          )}
        </div>
        
        {/* NO branch */}
        <div className="flex flex-col items-center">
          <div className="bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1 rounded-md mb-6">
            NO
          </div>
          {!hasNoConnection && (
            <button
              className="bg-gray-100 rounded-full w-6 h-6 flex items-center justify-center shadow-sm hover:bg-gray-200 nodrag"
              onClick={handleAddNoNode}
            >
              <Plus className="text-gray-600 size-3" />
            </button>
          )}
        </div>
      </div>

      {/* Input handle */}
      <Handle
        type="target"
        position={Position.Top}
        id="in"
        isConnectable={isConnectable}
        className="opacity-0"
        style={{ top: -1 }}
      />

      {/* Output handles for Yes and No branches */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="yes"
        isConnectable={isConnectable}
        className="opacity-0"
        style={{ bottom: -1, left: '25%' }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="no"
        isConnectable={isConnectable}
        className="opacity-0"
        style={{ bottom: -1, left: '75%' }}
      />
    </div>
  );
}