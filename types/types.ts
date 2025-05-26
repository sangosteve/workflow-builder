interface BaseNode {
	id: string;
	position: {
		x: number;
		y: number;
	};
}

export interface PlaceholderNode extends BaseNode {
	type: "PLACEHOLDER";
	data: {};
}

export interface TriggerNode extends BaseNode {
	type: "TRIGGER";
	data: { label: string };
}

export interface ActionNode extends BaseNode {
	type: "ACTION";
	data: { label: string };
}

export interface ConditionalNode extends BaseNode {
	type: "CONDITIONAL";
	data: { 
    label: string;
    status?: string;
  };
}

export type NodeType = PlaceholderNode | TriggerNode | ActionNode;

export type EdgeType = {
	id: string;
	source: string;
	target: string;
	type: string;
};
