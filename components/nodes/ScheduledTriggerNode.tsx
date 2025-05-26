import React from "react";
import { Handle, Position } from "@xyflow/react";
import { Calendar } from "lucide-react";

interface ScheduledTriggerNodeProps {
    data: {
        label: string;
        description?: string;
    };
    isConnectable?: boolean;
    selected?: boolean;
}

export default function ScheduledTriggerNode({
    data,
    isConnectable = true,
    selected
}: ScheduledTriggerNodeProps) {
    return (
        <div className="relative">
            <div className={`bg-white rounded-xl shadow-md p-5 w-64 border ${selected ? 'border-purple-400' : 'border-gray-100'}`}>
                <div className="flex items-start gap-4">
                    <div className="bg-purple-50 p-3 rounded-2xl">
                        <Calendar className="text-purple-600 size-5" strokeWidth={1.5} />
                    </div>
                    <div className="flex flex-col">
                        <div className="font-medium text-lg">{data.label}</div>
                        <div className="text-gray-500 text-sm">{data.description || "Scheduled trigger"}</div>
                    </div>
                </div>
            </div>

            {/* Connection stem between node and button */}
            <div className="absolute left-1/2 bottom-0 -translate-x-1/2">
                <div className="h-4 w-[2px] bg-gray-200"></div>
            </div>

            {/* Bottom plus button - positioned absolutely at the bottom center */}
            <div className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2">
                <button className="bg-white border border-gray-200 rounded-full w-8 h-8 flex items-center justify-center shadow-sm hover:shadow nodrag">
                    <span className="text-purple-600 text-xl font-medium">+</span>
                </button>
            </div>

            {/* Output handle */}
            <Handle
                type="source"
                position={Position.Bottom}
                id="out"
                isConnectable={isConnectable}
                className="w-2 h-2 bg-black border-0"
                style={{ bottom: -1, transform: "translateY(50%)" }}
            />
        </div>
    );
}