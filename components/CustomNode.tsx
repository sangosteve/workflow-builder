import { NodeProps } from '@xyflow/react';

export function CustomNode(props: NodeProps) {
    const { label } = props.data as { label: React.ReactNode };
    return (
        <div style={{ width: 200, padding: 10, background: '#fff', border: '1px solid #222' }}>
            {label}
        </div>
    );
}