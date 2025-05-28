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
	label?: string;
	positionX: number;
	positionY: number;
	createdAt: string;
	config?: {
		id: string;
		nodeId: string;
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
	const response = await fetch(`/api/workflows/${workflowId}/nodes`);
	if (!response.ok) {
		throw new Error("Failed to fetch workflow nodes");
	}
	return response.json();
}

async function fetchWorkflowEdges(workflowId: string): Promise<Edge[]> {
	const response = await fetch(`/api/workflows/${workflowId}/edges`);
	if (!response.ok) {
		throw new Error("Failed to fetch workflow edges");
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
		throw new Error("Failed to create node");
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
		throw new Error("Failed to create edge");
	}

	return response.json();
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
		queryKey: ["workflow", workflowId, "nodes"],
		queryFn: () => fetchWorkflowNodes(workflowId),
		enabled: !!workflowId,
	});
}

export function useWorkflowEdges(workflowId: string) {
	return useQuery({
		queryKey: ["workflow", workflowId, "edges"],
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
				queryKey: ["workflow", data.workflowId, "nodes"],
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
				queryKey: ["workflow", data.workflowId, "nodes"],
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
				queryKey: ["workflow", data.workflowId, "edges"],
			});
		},
	});
}
