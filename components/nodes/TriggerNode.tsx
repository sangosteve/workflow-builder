import React from "react";

export default function TriggerNode({ data }: { data: { label: string } }) {
    return (
        <div className="bg-white border rounded-xl shadow px-6 py-4 min-w-[180px] flex items-center">
            <span className="font-semibold text-lg">{data.label}</span>
        </div>
    );
}