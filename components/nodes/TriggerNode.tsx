import React, { useCallback, useState } from "react";
import { Handle, Position, useReactFlow, useNodeId } from "@xyflow/react";
import { Instagram, MoreVertical, UserPlus, MessageSquare, Heart, MessageCircle } from "lucide-react";
import AddNodeButton from "../AddNodeButton";
import TriggerNodeSheet from "../TriggerNodeSheet";

interface TriggerNodeProps {
  data: {
    label: string;
    triggerType?: string;
    description?: string;
  };
  isConnectable?: boolean;
  selected?: boolean;
}

export default function TriggerNode({
  data,
  isConnectable = true,
  selected
}: TriggerNodeProps) {
  const { setNodes, setEdges, getNode, getEdges } = useReactFlow();
  const id = useNodeId();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

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

  const handleNodeClick = (event: React.MouseEvent) => {
    // Prevent the click from propagating to the flow
    event.stopPropagation();
    setIsSheetOpen(true);
  };

  const handleUpdateNodeData = (updatedData: any) => {
    if (!id) return;

    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              ...updatedData
            }
          };
        }
        return node;
      })
    );
  };

  // Get the appropriate icon based on trigger type
  const getTriggerIcon = () => {
    switch (data.triggerType) {
      case 'follow':
        return <UserPlus className="text-white size-5" />;
      case 'comment':
        return <MessageSquare className="text-white size-5" />;
      case 'like':
        return <Heart className="text-white size-5" />;
      case 'direct-message':
        return <MessageCircle className="text-white size-5" />;
      default:
        return <Instagram className="text-white size-5" />;
    }
  };

  return (
    <div className="relative">
      {/* Main node */}
      <div
        className={`bg-white rounded-xl shadow-sm p-4 hover:cursor-pointer border border-pink-400 ${selected ? 'ring-2 ring-pink-300' : ''}`}
        style={{ width: '320px' }}
        onClick={handleNodeClick}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-2 rounded-lg">
              {getTriggerIcon()}
            </div>
            <div className="flex flex-col">
              <div className="font-medium">{data.label || 'Instagram Trigger'}</div>
              <div className="text-sm text-gray-600">{data.description || 'When a user interacts with your content'}</div>
            </div>
          </div>
          <button
            className="text-gray-400 hover:text-gray-600 nodrag"
            onClick={(e) => {
              e.stopPropagation();
              // Handle more options menu
            }}
          >
            <MoreVertical size={18} />
          </button>
        </div>
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

      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="out"
        isConnectable={isConnectable}
        className="opacity-0"
        style={{ bottom: -1 }}
      />

      {/* Trigger Node Sheet */}
      {isSheetOpen && (
        <TriggerNodeSheet
          isOpen={isSheetOpen}
          onClose={() => setIsSheetOpen(false)}
          data={data}
          onUpdate={handleUpdateNodeData}
        />
      )}
    </div>
  );
}