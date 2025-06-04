import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from './ui/button';
import AddNodeDialog from './workflow/AddNodeDialog';

interface AddNodeButtonProps {
  onAddNode: (nodeType: string) => void;
}

export default function AddNodeButton({ onAddNode }: AddNodeButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleOpenDialog = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDialogOpen(true);
  };

  const handleSelectNode = (nodeType: string) => {
    onAddNode(nodeType);
  };

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="rounded-full h-8 w-8 bg-white border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50"
        onClick={handleOpenDialog}
      >
        <Plus className="h-4 w-4 text-gray-500 hover:text-blue-500" />
      </Button>
      
      <AddNodeDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSelectNode={handleSelectNode}
      />
    </>
  );
}