interface BaseNode {
  id: string;
  position: {
    x: number;
    y: number;
  };
}

export interface PlaceholderNode extends BaseNode {
  type: "PLACEHOLDER";
  data: { label: string };
}

export interface TriggerNode extends BaseNode {
  type: "TRIGGER";
  data: { 
    label: string;
    triggerType?: string;
  };
}

export interface ActionNode extends BaseNode {
  type: "ACTION";
  data: { 
    label: string;
    status?: string;
    actionType?: string;
    message?: string;
  };
}

export interface ConditionalNode extends BaseNode {
  type: "CONDITIONAL";
  data: { 
    label: string;
    approvers?: Array<{
      id: string;
      name: string;
      initial?: string;
      color?: string;
    }>;
  };
}

export type NodeType = PlaceholderNode | TriggerNode | ActionNode | ConditionalNode;

export type EdgeType = {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  type?: string;
};
