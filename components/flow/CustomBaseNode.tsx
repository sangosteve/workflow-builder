import React from 'react'
import { BaseNode } from '../base-node'
import { Handle, NodeProps, Position } from '@xyflow/react'
import { Button } from '../ui/button'
import { Trash2 } from 'lucide-react'

const CustomBaseNode = ({ id, data }: NodeProps) => {
    return (
        <BaseNode className='w-[200px] h-[100px]'>
            Custom Base Node used as default
            <Button onClick={() => data.onRemove?.(id)} className='hover:cursor-pointer' variant={"ghost"} size={"icon"}>
                <Trash2 size={16} />
            </Button>
            <Handle type='target' position={Position.Top} />
            <Handle type='source' position={Position.Bottom} />
        </BaseNode>
    )
}

export default CustomBaseNode