"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Play, Edit, ExternalLink, Pause, Loader2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { WorkflowStatusBadge } from "@/components/WorkflowStatusBadge";
import { EditWorkflowDialog } from "@/components/workflow/EditWorkflowDialog";

interface WorkflowEditorNavbarProps {
  workflowId: string;
  initialWorkflowName?: string;
  initialWorkflowDescription?: string;
  onModeChange?: (mode: "editor" | "run") => void;
  publishState?: "DRAFT" | "ACTIVE" | "PAUSED";
  onPublish?: () => Promise<void>;
  onUnpublish?: () => Promise<void>;
  isPublishing?: boolean;
  className?: string;
  onWorkflowUpdated?: (workflow: { name: string; description?: string }) => void;
}

export default function WorkflowEditorNavbar({
  workflowId,
  initialWorkflowName = "Untitled Workflow",
  initialWorkflowDescription = "",
  onModeChange,
  publishState = "DRAFT",
  onPublish,
  onUnpublish,
  isPublishing = false,
  className,
  onWorkflowUpdated,
}: WorkflowEditorNavbarProps) {
  const [workflowName, setWorkflowName] = useState(initialWorkflowName);
  const [workflowDescription, setWorkflowDescription] = useState(initialWorkflowDescription);
  const [mode, setMode] = useState<"editor" | "run">("editor");
  const [isExecuting, setIsExecuting] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Fetch workflow details when component mounts
  useEffect(() => {
    const fetchWorkflowDetails = async () => {
      try {
        const response = await fetch(`/api/workflows/${workflowId}`);
        if (response.ok) {
          const data = await response.json();
          setWorkflowName(data.name || initialWorkflowName);
          setWorkflowDescription(data.description || initialWorkflowDescription);
        }
      } catch (error) {
        console.error("Error fetching workflow details:", error);
      }
    };

    if (workflowId) {
      fetchWorkflowDetails();
    }
  }, [workflowId, initialWorkflowName, initialWorkflowDescription]);

  // Update workflow name when initialWorkflowName changes
  useEffect(() => {
    if (initialWorkflowName) {
      setWorkflowName(initialWorkflowName);
    }
  }, [initialWorkflowName]);

  // Update workflow description when initialWorkflowDescription changes
  useEffect(() => {
    if (initialWorkflowDescription) {
      setWorkflowDescription(initialWorkflowDescription);
    }
  }, [initialWorkflowDescription]);

  // Handle mode change
  const handleModeChange = (newMode: "editor" | "run") => {
    setMode(newMode);
    if (onModeChange) {
      onModeChange(newMode);
    }
  };

  // Handle execute workflow
  const handleExecute = async () => {
    setIsExecuting(true);
    try {
      const response = await fetch(`/api/workflows/${workflowId}/execute`, {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to execute workflow");
      }

      const result = await response.json();
      toast.success("Workflow execution started", {
        description: `Run ID: ${result.runId}`,
      });
    } catch (error) {
      console.error("Error executing workflow:", error);
      toast.error("Failed to execute workflow", {
        description: (error as Error).message,
      });
    } finally {
      setIsExecuting(false);
    }
  };
  
  // Handle workflow update
  const handleWorkflowUpdated = (updatedWorkflow: { name: string; description?: string }) => {
    setWorkflowName(updatedWorkflow.name);
    if (updatedWorkflow.description !== undefined) {
      setWorkflowDescription(updatedWorkflow.description);
    }
    
    if (onWorkflowUpdated) {
      onWorkflowUpdated(updatedWorkflow);
    }
  };

  // Render the publish/unpublish button based on workflow status
  const renderPublishButton = () => {
    if (publishState === "ACTIVE") {
      return (
        <Button
          variant="outline"
          className="border-amber-200 text-amber-600 hover:bg-amber-50 hover:text-amber-700"
          onClick={onUnpublish}
          disabled={isPublishing}
        >
          {isPublishing ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Pause className="h-4 w-4 mr-2" />
          )}
          Unpublish
        </Button>
      );
    } else if (publishState === "PAUSED") {
      return (
        <Button
          variant="outline"
          className="border-green-200 text-green-600 hover:bg-green-50 hover:text-green-700"
          onClick={onPublish}
          disabled={isPublishing}
        >
          {isPublishing ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Play className="h-4 w-4 mr-2" />
          )}
          Resume
        </Button>
      );
    } else {
      // Default DRAFT state
      return (
        <Button
          variant="outline"
          className="border-green-200 text-green-600 hover:bg-green-50 hover:text-green-700"
          onClick={onPublish}
          disabled={isPublishing}
        >
          {isPublishing ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <ExternalLink className="h-4 w-4 mr-2" />
          )}
          Publish
        </Button>
      );
    }
  };

  return (
    <div className={cn("flex items-center justify-between bg-background border-b px-4 h-16", className)}>
      {/* Left section - Back button and title */}
      <div className="flex items-center space-x-4">
        <Link href="/workflows" className="text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-5 w-5" />
        </Link>

        <div className="flex items-center gap-2">
          <div className="flex items-center">
            <div>
              <h1 className="font-semibold text-lg">{workflowName}</h1>
              <p className="text-xs text-muted-foreground">Workflow Editor</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditDialogOpen(true)}
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>
          <WorkflowStatusBadge status={publishState} />
        </div>
      </div>

      {/* Center section - Editor/Run toggle */}
      <div className="bg-muted rounded-md p-1 flex">
        <Button
          variant={mode === "editor" ? "default" : "ghost"}
          size="sm"
          className={cn(
            "rounded-sm",
            mode === "editor" ? "" : "text-muted-foreground"
          )}
          onClick={() => handleModeChange("editor")}
        >
          <Edit className="h-4 w-4 mr-2" />
          Editor
        </Button>
        <Button
          variant={mode === "run" ? "default" : "ghost"}
          size="sm"
          className={cn(
            "rounded-sm",
            mode === "run" ? "" : "text-muted-foreground"
          )}
          onClick={() => handleModeChange("run")}
        >
          <Play className="h-4 w-4 mr-2" />
          Run
        </Button>
      </div>

      {/* Right section - Action buttons */}
      <div className="flex items-center space-x-2">
        <Button
          variant="default"
          className="bg-green-600 hover:bg-green-700 text-white"
          onClick={handleExecute}
          disabled={isExecuting || publishState !== "ACTIVE"}
        >
          {isExecuting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Play className="h-4 w-4 mr-2" />
          )}
          Execute
        </Button>

        {renderPublishButton()}
      </div>
      <EditWorkflowDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        workflow={{ name: workflowName, description: workflowDescription }}
        onWorkflowUpdated={handleWorkflowUpdated}
        workflowId={workflowId}
      />
    </div>
  );
}