// components/flow/TriggerNode.tsx
import React from 'react'
import { BaseNode } from '../base-node'
import { ButtonHandle } from '../button-handle'
import { Handle, Position } from '@xyflow/react'
import { Button } from '../ui/button'
import { Plus, Trash2 } from 'lucide-react'

interface TriggerNodeProps {
    id: string
    data: {
        label: string
        onAdd?: (sourceId: string) => void
        onRemove?: (id: string) => void
        hasChildNode?: boolean
    }
}

export default function TriggerNode({ id, data }: TriggerNodeProps) {
    const handleAdd = () => {
        data.onAdd?.(id)
    }

    const handleRemove = () => {
        data.onRemove?.(id)
    }

    return (
        <BaseNode className='w-[320px]'>
            {data.label || 'Trigger'}
            {/* {" " + id} */}
            <Handle className='invisible' type="target" position={Position.Top} />
            <ButtonHandle type="source" position={Position.Bottom} showButton={!data.hasChildNode}>
                <Button
                    onClick={handleAdd}
                    size="sm"
                    variant="secondary"
                    className="rounded-full cursor-pointer"
                >
                    <Plus size={10} />
                </Button>
            </ButtonHandle>
        </BaseNode>
    )
}
