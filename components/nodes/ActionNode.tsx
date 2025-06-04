import React, { useCallback, useState } from "react";
import { Handle, Position, useReactFlow, Edge } from "@xyflow/react";
import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";
import { MoreHorizontal, Trash2, Loader2, MessageCircle, Reply, UserPlus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import AddNodeButton from "../AddNodeButton";
import ActionNodeSheet from "../ActionNodeSheet";
import { createNode, createEdge } from "@/lib/api-hooks";

// Define the ActionNodeData type to replace 'any'
interface ActionNodeData {
  id?: string;
  label: string;
  status?: string;
  actionType?: string;
  message?: string;
  workflowId?: string;
}

interface ActionNodeProps {
  data: ActionNodeData;
  isConnectable?: boolean;
  selected?: boolean;
  id: string; // Add id prop to access the node's id
}

export default function ActionNode({
  data,
  isConnectable = true,
  selected,
  id
}: ActionNodeProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { setNodes, setEdges, getNode, getEdges } = useReactFlow();

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

    // Add another action node to the UI
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

  const handleDelete = useCallback(async () => {
    if (!id) return;

    setIsDeleting(true);
    try {
      // Get all edges connected to this node
      const edges = getEdges();
      const connectedEdges = edges.filter(
        edge => edge.source === id || edge.target === id
      );

      // Find source and target nodes that were connected to this node
      let sourceNodeId: string | null = null;
      let targetNodeId: string | null = null;

      connectedEdges.forEach(edge => {
        if (edge.target === id) {
          sourceNodeId = edge.source;
        }
        if (edge.source === id) {
          targetNodeId = edge.target;
        }
      });

      // Remove the node from the flow
      setNodes(nodes => nodes.filter(node => node.id !== id));

      // Remove all edges connected to this node
      setEdges(edges => edges.filter(
        edge => edge.source !== id && edge.target !== id
      ));

      // If both source and target nodes exist, create a new edge between them
      if (sourceNodeId && targetNodeId) {
        // Create a properly typed edge
        const newEdge: Edge = {
          id: `${sourceNodeId}-${targetNodeId}`,
          source: sourceNodeId,
          target: targetNodeId,
          type: 'buttonedge',
        };

        setEdges(edges => [...edges, newEdge]);
      }

      // If we have a workflowId, delete the node from the database
      if (data.workflowId) {
        const response = await fetch(`/api/nodes/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete node from database');
        }
      }
    } catch (error) {
      console.error("Failed to delete node:", error);
    } finally {
      setIsDeleting(false);
    }
  }, [id, getEdges, setNodes, setEdges, data.workflowId]);

  const handleNodeClick = (event: React.MouseEvent) => {
    // Prevent the click from propagating to the flow
    event.stopPropagation();
    setIsSheetOpen(true);
  };

  const handleUpdateNodeData = (updatedData: ActionNodeData) => {
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
        return <></>; // Removed default icon to avoid redundancy with Badge
    }
  };

  // Display the message if available, otherwise show the status
  const displayStatus = data.message || data.status;

  return (
    <div className="relative">
      {/* Main node */}
      <div
        className={`bg-white rounded-xl shadow-sm p-4 hover:cursor-pointer border border-blue-400 ${selected ? 'ring-2 ring-blue-300' : ''
          }`}
        style={{ width: '320px' }}
        onClick={handleNodeClick}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-blue-400 via-blue-500 to-blue-600 p-2 rounded-lg">
              {getActionIcon()}
            </div>
            <div className="flex flex-col">
              <div className="font-medium">{data.label || 'Action'}</div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild disabled={isDeleting}>
              <button
                className="text-gray-400 hover:text-gray-600 nodrag"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <MoreHorizontal size={18} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                }}
                className="text-red-600 focus:text-red-600"
                disabled={isDeleting}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {data.message && (
          <div className="mt-2 text-xs text-gray-500">{data.message}</div>
        )}

        {data.actionType && (
          <div className="mt-2">
            <Badge variant="outline" className="text-xs">
              {data.actionType}
            </Badge>
          </div>
        )}

        <Handle
          type="target"
          position={Position.Top}
          isConnectable={isConnectable}
          className="opacity-0"
          style={{ top: -1 }}
        />
        <Handle
          type="source"
          position={Position.Bottom}
          isConnectable={isConnectable}
          className="opacity-0"
          style={{ bottom: -1 }}
        />
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

      {/* Action Node Sheet */}
      {isSheetOpen && (
        <ActionNodeSheet
          isOpen={isSheetOpen}
          onClose={() => setIsSheetOpen(false)}
          data={{
            ...data,
            id: id || "",
            actionType: data.actionType || "direct-message"
          }}
          onUpdate={handleUpdateNodeData}
        />
      )}
    </div>
  );
}