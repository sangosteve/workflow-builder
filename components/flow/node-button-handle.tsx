import React from 'react';
import { BaseNode } from '../base-node';
import { ButtonHandle } from '../button-handle';
import { Handle, Position } from '@xyflow/react';
import { Button } from '../ui/button';
import { Plus, Trash2 } from 'lucide-react';

const NodeButtonHandle = ({ id, data }: { id: string; data: any }) => {
    const handleClick = () => {
        if (data?.onAdd) {
            data.onAdd(id); // pass current node id as source
        }
    };

    return (
        <BaseNode className="w-[200px] h-[100px]">
            Node with a handle button
            <Handle type="target" position={Position.Top} />
            <Button onClick={() => data.onRemove?.(id)} className='hover:cursor-pointer' variant={"ghost"} size={"icon"}>
                <Trash2 size={16} />
            </Button>
            <ButtonHandle type="source" position={Position.Bottom} showButton={true}>
                <Button
                    onClick={handleClick}
                    size="sm"
                    variant="secondary"
                    className="rounded-full cursor-pointer"
                >
                    <Plus size={10} />
                </Button>
            </ButtonHandle>
        </BaseNode>
    );
};

export default NodeButtonHandle;
