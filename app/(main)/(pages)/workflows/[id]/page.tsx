"use client";
import { useParams } from 'next/navigation';
import WorkflowEditor from '@/components/WorkflowEditor';
import { useEffect, useState } from 'react';

const WorkflowPage = () => {
    const params = useParams();
    const workflowId = params.id as string;
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchWorkflow = async () => {
            if (!workflowId) return;

            try {
                const response = await fetch(`/api/workflows/${workflowId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch workflow');
                }
                // We can still fetch the data to validate the workflow exists
                await response.json();
                // But we don't need to store it since it's not used
            } catch (err) {
                console.error('Error fetching workflow:', err);
                setError('Failed to load workflow. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchWorkflow();
    }, [workflowId]);

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
        <div className="w-full flex-1">
            <WorkflowEditor workflowId={workflowId} />
        </div>
    );
};

export default WorkflowPage;