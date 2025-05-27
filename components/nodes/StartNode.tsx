import React, { useCallback } from "react";
import { Handle, Position, useReactFlow, useNodeId } from "@xyflow/react";
import AddNodeButton from "../AddNodeButton";

interface StartNodeProps {
  data: {
    label: string;
  };
  isConnectable?: boolean;
  selected?: boolean;
}

export default function StartNode({
  data,
  isConnectable = true,
  selected
}: StartNodeProps) {
  const { setNodes, setEdges, getNode, getEdges } = useReactFlow();
  const id = useNodeId();

  // Check if this node has any outgoing connections
  const hasConnections = getEdges().some(edge => edge.source === id);

  const handleAddNode = useCallback((actionType: string) => {
    if (!id) return;

    const parentNode = getNode(id);
    if (!parentNode) return;

    // Create a unique ID for the new node
    const newNodeId = `action-${Date.now()}`;

    // Get label and status based on action type
    let label = '';
    let status = 'Action required';
    
    switch (actionType) {
      case 'direct-message':
        label = 'Send Direct Message';
        status = 'Message to be sent';
        break;
      case 'reply-comment':
        label = 'Reply to Comment';
        status = 'Reply to be posted';
        break;
      case 'follow-user':
        label = 'Follow User';
        status = 'User to be followed';
        break;
      default:
        label = 'Instagram Action';
    }

    // Add the new action node
    setNodes((nodes) => [
      ...nodes,
      {
        id: newNodeId,
        type: 'action',
        position: {
          x: parentNode.position.x,
          y: parentNode.position.y + 120, // Position below the current node
        },
        data: {
          label,
          status,
          actionType
        },
      },
    ]);

    // Add an edge connecting the current node to the new node
    setEdges((edges) => [
      ...edges,
      {
        id: `${id}-${newNodeId}`,
        source: id,
        target: newNodeId,
        type: 'buttonedge', // Use our custom edge type
      },
    ]);
  }, [id, getNode, setNodes, setEdges]);

  return (
    <div className="relative">
      {/* Main node */}
      <div className={`bg-white rounded-sm shadow-sm p-4 px-8 border ${selected ? 'border-purple-400' : 'border-gray-100'}`}>
        <div className="text-center font-medium">{data.label}</div>
      </div>

      {/* Connection line - only show if no connections */}
      {!hasConnections && (
        <div className="absolute left-1/2 -translate-x-1/2" style={{ top: '100%' }}>
          <div className="h-12 w-[1px] bg-gray-300"></div>
        </div>
      )}

      {/* Plus button - only show if no connections */}
      {!hasConnections && (
        <div className="absolute left-1/2 -translate-x-1/2" style={{ top: 'calc(100% + 50px)' }}>
          <AddNodeButton onAddNode={handleAddNode} />
        </div>
      )}

      {/* Output handle - invisible but functional */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="out"
        isConnectable={isConnectable}
        className="opacity-0" // Make it invisible
        style={{ bottom: -1 }}
      />
    </div>
  );
}