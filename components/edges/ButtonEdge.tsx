import React, { useCallback } from "react";
import { EdgeProps, getBezierPath, useReactFlow } from "@xyflow/react";
import AddNodeButton from "../AddNodeButton";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";

export default function ButtonEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  source,
  target,
}: EdgeProps) {
  const { setNodes, setEdges } = useReactFlow();

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const handleAddNode = useCallback((actionType: string) => {
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

    // Add the new action node at the midpoint between source and target
    setNodes((nodes) => [
      ...nodes,
      {
        id: newNodeId,
        type: 'action', // Using action node type
        position: {
          x: (sourceX + targetX) / 2 - 160, // Center the node horizontally
          y: (sourceY + targetY) / 2, // Position at the midpoint vertically
        },
        data: {
          label,
          status,
          actionType
        },
      },
    ]);

    // Remove the current edge
    setEdges((edges) => edges.filter((edge) => edge.id !== id));

    // Add two new edges
    setEdges((edges) => [
      ...edges,
      {
        id: `${source}-${newNodeId}`,
        source,
        target: newNodeId,
        type: 'buttonedge',
      },
      {
        id: `${newNodeId}-${target}`,
        source: newNodeId,
        target,
        type: 'buttonedge',
      },
    ]);
  }, [id, source, target, sourceX, sourceY, targetX, targetY, setNodes, setEdges]);

  return (
    <>
      <path
        id={id}
        style={{ ...style, strokeWidth: 1, stroke: '#ccc' }}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
      />

      {/* Plus button in the middle of the edge */}
      <foreignObject
        width={40}
        height={40}
        x={labelX - 20}
        y={labelY - 20}
        className="edgebutton-foreignobject"
        requiredExtensions="http://www.w3.org/1999/xhtml"
      >
        <div className="flex items-center justify-center w-full h-full">
          <div className="relative">
            <AddNodeButton onAddNode={handleAddNode} />
          </div>
        </div>
      </foreignObject>
    </>
  );
}