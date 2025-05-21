// components/flow/ActionNode.tsx
import React from 'react'
import { BaseNode } from '../base-node'
import { ButtonHandle } from '../button-handle'
import { Handle, Position } from '@xyflow/react'
import { Button } from '../ui/button'
import { Plus, Trash2 } from 'lucide-react'

interface ActionNodeProps {
    id: string
    data: {
        label: string
        onAdd?: (sourceId: string) => void
        onRemove?: (id: string) => void
        hasChildNode?: boolean
    }
}

export default function ActionNode({ id, data }: ActionNodeProps) {
    const handleAdd = () => {
        data.onAdd?.(id)
    }

    const handleRemove = () => {
        data.onRemove?.(id)
    }

    return (
        <BaseNode className='w-[320px]'>
            {data.label || 'Action'}
            {/* {" " + id} */}
            <Handle className='invisible' type="target" position={Position.Top} />
            <Button onClick={handleRemove} className="hover:cursor-pointer" variant="ghost" size="icon">
                <Trash2 size={16} />
            </Button>
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
