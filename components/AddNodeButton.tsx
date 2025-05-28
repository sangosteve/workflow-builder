import React, { useState } from "react";
import { Plus, MessageCircle, Reply, UserPlus, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface AddNodeButtonProps {
  onAddNode: (actionType: string) => void;
}

export default function AddNodeButton({ onAddNode }: AddNodeButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const handleAddNode = async (actionType: string) => {
    setIsLoading(true);
    setLoadingAction(actionType);
    
    try {
      await onAddNode(actionType);
    } finally {
      setIsLoading(false);
      setLoadingAction(null);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={"ghost"}
          size={"icon"}
          className="bg-purple-100 rounded-full w-6 h-6 flex items-center justify-center shadow-sm hover:cursor-pointer hover:bg-purple-200 nodrag"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="text-purple-600 text-sm font-medium animate-spin" />
          ) : (
            <Plus className="text-purple-600 text-sm font-medium" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center">
        <DropdownMenuItem 
          onClick={() => handleAddNode('direct-message')}
          disabled={isLoading}
          className={loadingAction === 'direct-message' ? 'opacity-50' : ''}
        >
          {loadingAction === 'direct-message' ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <MessageCircle className="mr-2 h-4 w-4" />
          )}
          <span>Send Direct Message</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleAddNode('reply-comment')}
          disabled={isLoading}
          className={loadingAction === 'reply-comment' ? 'opacity-50' : ''}
        >
          {loadingAction === 'reply-comment' ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Reply className="mr-2 h-4 w-4" />
          )}
          <span>Reply to Comment</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleAddNode('follow-user')}
          disabled={isLoading}
          className={loadingAction === 'follow-user' ? 'opacity-50' : ''}
        >
          {loadingAction === 'follow-user' ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <UserPlus className="mr-2 h-4 w-4" />
          )}
          <span>Follow User</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}