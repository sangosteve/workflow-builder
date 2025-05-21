export type NodeType = "trigger" | "action";

export interface BaseFlowNodeData {
	id: string;
	type: NodeType;
	label?: string;
	onAdd?: (sourceId: string) => void;
	onRemove?: (nodeId: string) => void;
}

export interface TriggerNodeData extends BaseFlowNodeData {
	type: "trigger";
	// You can extend this later with trigger-specific properties
}

export interface ActionNodeData extends BaseFlowNodeData {
	type: "action";
	message?: string; // For message-based nodes like Instagram DMs
}

export type FlowNodeData = TriggerNodeData | ActionNodeData;
