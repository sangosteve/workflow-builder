import React from 'react';
import { Button } from '../ui/button';
import {
    BaseEdge,
    EdgeLabelRenderer,
    getBezierPath,
    useReactFlow,
    type EdgeProps,
} from '@xyflow/react';
import { Plus } from 'lucide-react';

export default function ButtonEdge({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
}: EdgeProps) {
    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });


    return (
        <>
            <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
            <EdgeLabelRenderer>
                <div
                    className="nodrag nopan"
                    style={{
                        position: 'absolute',
                        transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
                        pointerEvents: 'all',
                        zIndex: 1000,
                    }}
                >

                    <Button

                        size="sm"
                        variant="secondary"
                        className="rounded-full cursor-pointer">
                        <Plus size={10} />
                    </Button>
                </div>
            </EdgeLabelRenderer>
        </>
    );
}