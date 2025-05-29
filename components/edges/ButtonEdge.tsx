import React, { useCallback } from "react";
import { EdgeProps, getBezierPath, useReactFlow } from "@xyflow/react";
import AddNodeButton from "../AddNodeButton";
import { Plus } from "lucide-react";
import { createNode, createEdge } from "@/lib/api-hooks";

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
  data,
}: EdgeProps) {
  const { setNodes, setEdges, getNode, getNodes } = useReactFlow();

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const handleAddNode = useCallback(async (actionType: string) => {
    // Create a unique ID for the new node
    const newNodeId = `action-${Date.now()}`;

    // Get source and target nodes
    const sourceNode = getNode(source);
    const targetNode = getNode(target);
    
    if (!sourceNode || !targetNode) return;

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

    // For consistent positioning, use the same X as the source node
    // and position Y at a fixed distance from the source node
    const newNodeX = 100; // Consistent X position
    const verticalSpacing = 200; // Consistent vertical spacing
    const newNodeY = sourceNode.position.y + verticalSpacing;

    // Extract workflowId from source or target node data
    const workflowId = sourceNode.data.workflowId || targetNode.data.workflowId;

    // Get all nodes that need to be shifted down
    const allNodes = getNodes();
    const nodesToShift = allNodes.filter(node => 
      node.position.y >= newNodeY && node.id !== newNodeId
    );

    // Add the new action node
    setNodes((nodes) => [
      ...nodes,
      {
        id: newNodeId,
        type: 'action', // Using action node type
        position: {
          x: newNodeX,
          y: newNodeY,
        },
        data: {
          label,
          status,
          actionType,
          workflowId
        },
      },
    ]);

    // Shift down all nodes that are below the new node
    setNodes((nodes) => 
      nodes.map(node => {
        if (nodesToShift.some(n => n.id === node.id)) {
          return {
            ...node,
            position: {
              x: node.position.x,
              y: node.position.y + verticalSpacing
            }
          };
        }
        return node;
      })
    );

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

    // If we have a workflowId, create the node and edges in the database
    if (workflowId) {
      try {
        console.log(`Creating node at position (${newNodeX}, ${newNodeY})`);
        
        // Create the node in the database
        const createdNode = await createNode({
          workflowId,
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

        // Update positions of shifted nodes in the database
        // This would require a batch update API endpoint
        // For now, we'll just log that this should happen
        console.log("Nodes that need position updates in database:", 
          nodesToShift.map(node => ({
            id: node.id,
            newY: node.position.y + verticalSpacing
          }))
        );

        // Create the first edge (source to new node)
        await createEdge({
          workflowId,
          sourceNodeId: source,
          targetNodeId: createdNode.id,
          label: "",
          condition: ""
        });

        // Create the second edge (new node to target)
        await createEdge({
          workflowId,
          sourceNodeId: createdNode.id,
          targetNodeId: target,
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

        // Update the edges in the UI to use the new node ID
        setEdges((edges) =>
          edges.map((edge) => {
            if (edge.id === `${source}-${newNodeId}`) {
              return { ...edge, id: `${source}-${createdNode.id}`, target: createdNode.id };
            }
            if (edge.id === `${newNodeId}-${target}`) {
              return { ...edge, id: `${createdNode.id}-${target}`, source: createdNode.id };
            }
            return edge;
          })
        );
      } catch (error) {
        console.error("Failed to create node or edges in database:", error);
      }
    }
  }, [id, source, target, getNode, getNodes, setNodes, setEdges]);

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