import React, { useCallback, useState } from "react";
import { Handle, Position, useReactFlow, useNodeId } from "@xyflow/react";
import { Instagram, MoreVertical, MessageCircle, Reply, UserPlus } from "lucide-react";
import AddNodeButton from "../AddNodeButton";
import ActionNodeSheet from "../ActionNodeSheet";
import { createNode, createEdge } from "@/lib/api-hooks";

interface ActionNodeProps {
  data: {
    label: string;
    status?: string;
    actionType?: string;
    message?: string;
    workflowId?: string; // Ensure workflowId is included in the data prop
  };
  isConnectable?: boolean;
  selected?: boolean;
}

export default function ActionNode({
  data,
  isConnectable = true,
  selected
}: ActionNodeProps) {
  const { setNodes, setEdges, getNode, getEdges } = useReactFlow();
  const id = useNodeId();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Check if this node has any outgoing connections
  const hasConnections = getEdges().some(edge => edge.source === id);

  const handleAddNode = useCallback(async (actionType: string) => {
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

    // Add another action node to the UI
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
          actionType,
          workflowId: data.workflowId
        },
      },
    ]);

    // Add an edge connecting the current node to the new node in the UI
    setEdges((edges) => [
      ...edges,
      {
        id: `${id}-${newNodeId}`,
        source: id,
        target: newNodeId,
        type: 'buttonedge', // Use our custom edge type
      },
    ]);

    // If we have a workflowId, create the node and edge in the database
    if (data.workflowId) {
      try {
        // Create the node in the database
        const createdNode = await createNode({
          workflowId: data.workflowId,
          type: 'ACTION',
          label,
          positionX: parentNode.position.x,
          positionY: parentNode.position.y + 120,
          config: {
            actionType,
            status
          }
        });

        console.log("Created node in database:", createdNode);

        // Create the edge in the database
        await createEdge({
          workflowId: data.workflowId,
          sourceNodeId: id,
          targetNodeId: createdNode.id,
          label: "",
          condition: ""
        });

        // Update the node ID in the UI to match the database ID
        setNodes((nodes) => 
          nodes.map((node) => 
            node.id === newNodeId 
              ? { ...node, id: createdNode.id } 
              : node
          )
        );

        // Update the edge in the UI to use the new node ID
        setEdges((edges) => 
          edges.map((edge) => 
            edge.id === `${id}-${newNodeId}` 
              ? { ...edge, id: `${id}-${createdNode.id}`, target: createdNode.id } 
              : edge
          )
        );
      } catch (error) {
        console.error("Failed to create node or edge in database:", error);
      }
    }
  }, [id, getNode, setNodes, setEdges, data.workflowId]);

  // Determine which icon to show based on action type
  const getActionIcon = () => {
    switch (data.actionType) {
      case 'direct-message':
        return <MessageCircle className="text-white size-5" />;
      case 'reply-comment':
        return <Reply className="text-white size-5" />;
      case 'follow-user':
        return <UserPlus className="text-white size-5" />;
      default:
        return <Instagram className="text-white size-5" />;
    }
  };

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

  // Display the message if available, otherwise show the status
  const displayStatus = data.message || data.status;

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
              {getActionIcon()}
            </div>
            <div className="flex flex-col">
              <div className="font-medium">{data.label}</div>
              {displayStatus && (
                <div className="text-sm text-gray-600">{displayStatus}</div>
              )}
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

      {/* Input handle */}
      <Handle
        type="target"
        position={Position.Top}
        id="in"
        isConnectable={isConnectable}
        className="opacity-0"
        style={{ top: -1 }}
      />

      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="out"
        isConnectable={isConnectable}
        className="opacity-0"
        style={{ bottom: -1 }}
      />

      {/* Action Node Sheet */}
      {isSheetOpen && (
        <ActionNodeSheet 
          isOpen={isSheetOpen} 
          onClose={() => setIsSheetOpen(false)} 
          data={data} 
          onUpdate={handleUpdateNodeData} 
        />
      )}
    </div>
  );
}