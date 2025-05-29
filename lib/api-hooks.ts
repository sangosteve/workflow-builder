import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Types
interface Workflow {
	id: string;
	name: string;
	description?: string;
	status: string;
	triggersCount: number;
	actionsCount: number;
	lastEdited: string;
	createdAt: string;
}

interface Node {
	id: string;
	workflowId: string;
	type: string;
	label: string;
	positionX: number;
	positionY: number;
	config?: {
		config: any;
	};
}

interface Edge {
	id: string;
	workflowId: string;
	sourceNodeId: string;
	targetNodeId: string;
	label?: string;
	condition?: string;
	createdAt: string;
}

// API functions
async function fetchWorkflows(): Promise<Workflow[]> {
	const response = await fetch("/api/workflows");
	if (!response.ok) {
		throw new Error("Failed to fetch workflows");
	}
	return response.json();
}

async function fetchWorkflow(id: string): Promise<Workflow> {
	const response = await fetch(`/api/workflows/${id}`);
	if (!response.ok) {
		throw new Error("Failed to fetch workflow");
	}
	return response.json();
}

async function fetchWorkflowNodes(workflowId: string): Promise<Node[]> {
	if (!workflowId) return [];

	const response = await fetch(`/api/nodes?workflowId=${workflowId}`);
	if (!response.ok) {
		throw new Error("Failed to fetch nodes");
	}
	return response.json();
}

async function fetchWorkflowEdges(workflowId: string): Promise<Edge[]> {
	if (!workflowId) return [];

	const response = await fetch(`/api/edges?workflowId=${workflowId}`);
	if (!response.ok) {
		throw new Error("Failed to fetch edges");
	}
	return response.json();
}

async function createNode(nodeData: any): Promise<Node> {
	const response = await fetch("/api/nodes", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(nodeData),
	});

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(errorData.error || "Failed to create node");
	}

	return response.json();
}

async function updateNode(nodeId: string, nodeData: any): Promise<Node> {
	const response = await fetch(`/api/nodes/${nodeId}`, {
		method: "PATCH",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(nodeData),
	});

	if (!response.ok) {
		throw new Error("Failed to update node");
	}

	return response.json();
}

async function createEdge(edgeData: any): Promise<Edge> {
	const response = await fetch("/api/edges", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(edgeData),
	});

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(errorData.error || "Failed to create edge");
	}

	return response.json();
}

/**
 * Updates the position of a node in the database
 */
async function updateNodePosition({
	nodeId,
	workflowId,
	positionX,
	positionY,
}: {
	nodeId: string;
	workflowId: string;
	positionX: number;
	positionY: number;
}) {
	try {
		const response = await fetch(
			`/api/workflows/${workflowId}/nodes/${nodeId}/position`,
			{
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					positionX,
					positionY,
				}),
			}
		);

		if (!response.ok) {
			throw new Error(`Failed to update node position: ${response.statusText}`);
		}

		return await response.json();
	} catch (error) {
		console.error("Error updating node position:", error);
		throw error;
	}
}

// React Query Hooks
export function useWorkflows() {
	return useQuery({
		queryKey: ["workflows"],
		queryFn: fetchWorkflows,
	});
}

export function useWorkflow(id: string) {
	return useQuery({
		queryKey: ["workflow", id],
		queryFn: () => fetchWorkflow(id),
		enabled: !!id,
	});
}

export function useWorkflowNodes(workflowId: string) {
	return useQuery({
		queryKey: ["workflowNodes", workflowId],
		queryFn: () => fetchWorkflowNodes(workflowId),
		enabled: !!workflowId,
	});
}

export function useWorkflowEdges(workflowId: string) {
	return useQuery({
		queryKey: ["workflowEdges", workflowId],
		queryFn: () => fetchWorkflowEdges(workflowId),
		enabled: !!workflowId,
	});
}

export function useCreateNode() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: createNode,
		onSuccess: (data) => {
			// Invalidate and refetch nodes for this workflow
			queryClient.invalidateQueries({
				queryKey: ["workflowNodes", data.workflowId],
			});
			// Also update the workflow to reflect updated counts
			queryClient.invalidateQueries({
				queryKey: ["workflow", data.workflowId],
			});
		},
	});
}

export function useUpdateNode() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: any }) =>
			updateNode(id, data),
		onSuccess: (data) => {
			// Invalidate and refetch nodes for this workflow
			queryClient.invalidateQueries({
				queryKey: ["workflowNodes", data.workflowId],
			});
		},
	});
}

export function useCreateEdge() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: createEdge,
		onSuccess: (data) => {
			// Invalidate and refetch edges for this workflow
			queryClient.invalidateQueries({
				queryKey: ["workflowEdges", data.workflowId],
			});
		},
	});
}

export { createNode, createEdge, updateNodePosition };
