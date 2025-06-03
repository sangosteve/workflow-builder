"use client";
import { useParams } from 'next/navigation';
import WorkflowEditor from '@/components/WorkflowEditor';
import WorkflowEditorNavbar from '@/components/workflow/WorkflowEditorNavbar';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const WorkflowPage = () => {
    const params = useParams();
    const workflowId = params.id as string;
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editorMode, setEditorMode] = useState<"editor" | "run">("editor");
    const [workflowData, setWorkflowData] = useState<{
        name: string;
        status: "DRAFT" | "ACTIVE" | "PAUSED";
    } | null>(null);
    const [isPublishing, setIsPublishing] = useState(false);

    // Fetch workflow data
    const fetchWorkflow = async () => {
        if (!workflowId) return;

        try {
            const response = await fetch(`/api/workflows/${workflowId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch workflow');
            }
            const data = await response.json();
            setWorkflowData(data);
        } catch (err) {
            console.error('Error fetching workflow:', err);
            setError('Failed to load workflow. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchWorkflow();
    }, [workflowId]);

    const handleModeChange = (mode: "editor" | "run") => {
        setEditorMode(mode);
    };

    const handlePublish = async () => {
        setIsPublishing(true);
        try {
            const response = await fetch(`/api/workflows/${workflowId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: 'ACTIVE' }),
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to publish workflow');
            }
            
            const updatedWorkflow = await response.json();
            setWorkflowData(updatedWorkflow);
            toast.success("Workflow published successfully");
        } catch (error) {
            console.error('Error publishing workflow:', error);
            toast.error((error as Error).message || "Failed to publish workflow");
        } finally {
            setIsPublishing(false);
        }
    };

    const handleUnpublish = async () => {
        setIsPublishing(true);
        try {
            const response = await fetch(`/api/workflows/${workflowId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: 'DRAFT' }),
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to unpublish workflow');
            }
            
            const updatedWorkflow = await response.json();
            setWorkflowData(updatedWorkflow);
            toast.success("Workflow unpublished successfully");
        } catch (error) {
            console.error('Error unpublishing workflow:', error);
            toast.error((error as Error).message || "Failed to unpublish workflow");
        } finally {
            setIsPublishing(false);
        }
    };

    if (isLoading) {
        return (
            <div className="w-full flex-1 flex items-center justify-center">
                <div className="text-lg">Loading workflow...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full flex-1 flex items-center justify-center">
                <div className="text-lg text-red-500">{error}</div>
            </div>
        );
    }

    return (
        <div className="w-full flex-1 flex flex-col">
            <WorkflowEditorNavbar
                workflowId={workflowId}
                initialWorkflowName={workflowData?.name}
                onModeChange={handleModeChange}
                publishState={workflowData?.status || "DRAFT"}
                onPublish={handlePublish}
                onUnpublish={handleUnpublish}
                isPublishing={isPublishing}
            />
            <WorkflowEditor
                workflowId={workflowId}
                readOnly={editorMode === "run"}
                className="flex-1"
            />
        </div>
    );
};

export default WorkflowPage;