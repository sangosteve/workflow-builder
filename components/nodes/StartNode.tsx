import React, { useCallback } from "react";
import { Handle, Position, useReactFlow, useNodeId } from "@xyflow/react";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";

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

  const handleAddNode = useCallback(() => {
    if (!id) return;

    const parentNode = getNode(id);
    if (!parentNode) return;

    // Create a unique ID for the new node
    const newNodeId = `action-${Date.now()}`;

    // Add the new action node (instead of conditional)
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
          label: 'Send email notification',
          status: 'Action required'
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
          <Button
            variant={"ghost"}
            size={"icon"}
            className="bg-primary-foreground hover:cursor-pointer rounded-full w-5 h-5 flex items-center justify-center shadow-sm nodrag"
            onClick={handleAddNode}
          >
            <Plus className="text-purple-600 text-sm font-medium" />
          </Button>
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