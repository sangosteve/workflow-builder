"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Pencil } from "lucide-react";
import { toast } from "sonner";

interface EditWorkflowDialogProps {
  isOpen: boolean;
  onClose: () => void;
  workflow: {
    name: string;
    description: string;
  };
  onWorkflowUpdated: (updatedWorkflow: { name: string; description?: string }) => void;
  workflowId?: string;
  trigger?: React.ReactNode;
}

export function EditWorkflowDialog({
  isOpen,
  onClose,
  workflow,
  onWorkflowUpdated,
  workflowId,
  trigger,
}: EditWorkflowDialogProps) {
  const [name, setName] = useState(workflow.name);
  const [description, setDescription] = useState(workflow.description);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update local state when workflow prop changes
  useEffect(() => {
    setName(workflow.name);
    setDescription(workflow.description);
  }, [workflow]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error("Workflow name cannot be empty");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // If workflowId is provided, update the workflow in the API
      if (workflowId) {
        const response = await fetch(`/api/workflows/${workflowId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            description,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to update workflow");
        }

        await response.json();
      }

      // Call the callback with updated data
      onWorkflowUpdated({ name, description });
      toast.success("Workflow updated successfully");
      onClose();
    } catch (error) {
      console.error("Error updating workflow:", error);
      toast.error((error as Error).message || "Failed to update workflow");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Edit workflow</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Workflow</DialogTitle>
            <DialogDescription>
              Update the name and description of your workflow.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Workflow Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter workflow name"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what this workflow does"
                rows={4}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}