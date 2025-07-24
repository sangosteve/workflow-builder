"use client";

import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useParams } from 'next/navigation';
import WorkflowEditorNavbar from '@/components/workflow/WorkflowEditorNavbar';
import WorkflowEditor from '@/components/WorkflowEditor';

const WorkflowPage = () => {
    const params = useParams();
    const workflowId = params.id as string;
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editorMode, setEditorMode] = useState<"editor" | "run">("editor");
    const [workflowData, setWorkflowData] = useState<{
        name: string;
        description: string;
        status: "DRAFT" | "ACTIVE" | "PAUSED";
    } | null>(null);
    const [isPublishing, setIsPublishing] = useState(false);

    const fetchWorkflow = useCallback(async () => {
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
    }, [workflowId]);

    useEffect(() => {
        fetchWorkflow();
    }, [fetchWorkflow]);

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
            <div className="w-full h-full flex items-center justify-center">
                <div className="text-lg">Loading workflow...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <div className="text-lg text-red-500">{error}</div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <WorkflowEditorNavbar
                workflowId={workflowId}
                initialWorkflowName={workflowData?.name}
                initialWorkflowDescription={workflowData?.description}
                publishState={workflowData?.status || "DRAFT"}
                onModeChange={handleModeChange}
                onPublish={handlePublish}
                onUnpublish={handleUnpublish}
                isPublishing={isPublishing}
            />
            <div className="flex-1 h-[calc(100%-64px)]">
                <WorkflowEditor
                    workflowId={workflowId}
                    readOnly={editorMode === "run"}
                />
            </div>
        </div>
    );
};

export default WorkflowPage;