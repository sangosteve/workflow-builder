import { Badge } from "@/components/ui/badge";

type WorkflowStatus = "DRAFT" | "ACTIVE" | "PAUSED";

interface WorkflowStatusBadgeProps {
  status: WorkflowStatus;
}

export function WorkflowStatusBadge({ status }: WorkflowStatusBadgeProps) {
  switch (status) {
    case "ACTIVE":
      return <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>;
    case "DRAFT":
      return <Badge variant="outline" className="text-muted-foreground">Draft</Badge>;
    case "PAUSED":
      return <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-200">Paused</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
}