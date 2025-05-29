import TriggerNodeSheet from "../TriggerNodeSheet";
import AddNodeButton from "../AddNodeButton";
import React, { useCallback, useState } from "react";
import { Handle, Position, useReactFlow, useNodeId } from "@xyflow/react";
import { Instagram, MoreVertical, UserPlus, MessageSquare, Heart, MessageCircle } from "lucide-react";
import { createNode, createEdge } from "@/lib/api-hooks";

type TriggerNodeProps = {
  data: {
    label?: string;
    description?: string;
    triggerType?: string;
    workflowId?: string;
    [key: string]: any;
  };
  isConnectable?: boolean;
  selected?: boolean;
};

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

  const handleAddNode = useCallback(async (actionType: string) => {
    if (!id) return;

    const parentNode = getNode(id);
    if (!parentNode) return;

    // Create a unique ID for the new node
    const newNodeId = `action-${Date.now()}`;

    // Position for the new node - keep X at 100, add 200 to Y from parent
    const newNodeX = 100; // Consistent X position
    const newNodeY = parentNode.position.y + 200; // Position 200 units below the current node

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

    // Add the new action node to the UI
    setNodes((nodes) => [
      ...nodes,
      {
        id: newNodeId,
        type: 'action',
        position: {
          x: newNodeX,
          y: newNodeY,
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
        console.log("Creating node with workflowId:", data.workflowId);
        console.log("Source node ID:", id);
        console.log(`Creating node at position (${newNodeX}, ${newNodeY})`);

        // Create the node in the database
        const createdNode = await createNode({
          workflowId: data.workflowId,
          type: 'ACTION',
          label,
          positionX: newNodeX,
          positionY: newNodeY,
          config: {
            actionType,
            status
          }
        });

        console.log("Created node in database:", createdNode);

        // Create the edge in the database
        const edgeData = {
          workflowId: data.workflowId,
          sourceNodeId: id,
          targetNodeId: createdNode.id,
          label: "",
          condition: ""
        };

        console.log("Creating edge with data:", edgeData);

        await createEdge(edgeData);

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
          data={{
            ...data,
            id: id || "" // Pass the node ID explicitly
          }}
          onUpdate={handleUpdateNodeData}
        />
      )}
    </div>
  );
}