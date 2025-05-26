import React, { useCallback } from "react";
import { EdgeProps, getBezierPath, useReactFlow } from "@xyflow/react";
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

  const handleAddNode = useCallback(() => {
    // Create a unique ID for the new node
    const newNodeId = `action-${Date.now()}`;

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
          label: 'Send email notification',
          status: 'Action required'
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
        width={20}
        height={20}
        x={labelX - 10}
        y={labelY - 10}
        className="edgebutton-foreignobject"
        requiredExtensions="http://www.w3.org/1999/xhtml"
      >
        <div>
          <Button
            size={"icon"}
            className="bg-purple-100 rounded-full w-5 h-5 flex items-center justify-center shadow-sm hover:bg-purple-200 border border-purple-200"
            onClick={(event) => {
              event.stopPropagation();
              handleAddNode();
            }}
          >
            <Plus className="text-purple-600 text-sm font-medium" />
          </Button>
        </div>
      </foreignObject>
    </>
  );
}