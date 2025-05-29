import { Node as ReactFlowNode, Edge as ReactFlowEdge } from "@xyflow/react";
import { Node as DbNode } from "@prisma/client";

// This function transforms database nodes into ReactFlow nodes
export function transformDbNodesToReactFlow(dbNodes: any[]): ReactFlowNode[] {
	console.log("Transforming DB nodes to ReactFlow nodes:", dbNodes);
	return dbNodes.map((dbNode) => {
		// Map the node type from database enum to ReactFlow node type
		let nodeType = "default";
		switch (dbNode.type) {
			case "TRIGGER":
				nodeType = "trigger";
				break;
			case "ACTION":
				nodeType = "action";
				break;
			case "CONDITION":
				nodeType = "conditional";
				break;
		}

		// Extract configuration data
		const configData = dbNode.config?.config || {};

		// Create the ReactFlow node
		return {
			id: dbNode.id,
			position: { x: dbNode.positionX, y: dbNode.positionY },
			type: nodeType,
			data: {
				label: dbNode.label || "Unnamed Node",
				...configData, // Spread all config properties into the data object
			},
		};
	});
}

// This function transforms ReactFlow nodes back to database format
export function transformReactFlowNodesToDb(
	reactFlowNodes: ReactFlowNode[],
	workflowId: string
) {
	return reactFlowNodes.map((node) => {
		// Map the node type from ReactFlow to database enum
		let dbNodeType = "ACTION";
		switch (node.type) {
			case "trigger":
				dbNodeType = "TRIGGER";
				break;
			case "action":
				dbNodeType = "ACTION";
				break;
			case "conditional":
				dbNodeType = "CONDITION";
				break;
		}

		// Extract position
		const position = node.position || { x: 0, y: 0 };

		// Create the database node object
		return {
			id: node.id,
			workflowId,
			type: dbNodeType,
			label: node.data.label,
			positionX: position.x,
			positionY: position.y,
			config: {
				// Remove label from config as it's already in the node
				...Object.fromEntries(
					Object.entries(node.data).filter(([key]) => key !== "label")
				),
			},
		};
	});
}

// This function transforms database edges into ReactFlow edges
export function transformDbEdgesToReactFlow(dbEdges: any[]): ReactFlowEdge[] {
	return dbEdges.map((dbEdge) => {
		return {
			id: dbEdge.id,
			source: dbEdge.sourceNodeId,
			target: dbEdge.targetNodeId,
			label: dbEdge.label || "",
			data: {
				condition: dbEdge.condition || "",
			},
			type: "buttonedge", // Use your custom edge type
		};
	});
}
