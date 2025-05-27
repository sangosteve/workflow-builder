import React from "react";
import { Plus, MessageCircle, Reply, UserPlus } from "lucide-react";
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
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={"ghost"}
          size={"icon"}
          className="bg-purple-100 rounded-full w-6 h-6 flex items-center justify-center shadow-sm hover:cursor-pointer hover:bg-purple-200 nodrag"
        >
          <Plus className="text-purple-600 text-sm font-medium" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center">
        <DropdownMenuItem onClick={() => onAddNode('direct-message')}>
          <MessageCircle className="mr-2 h-4 w-4" />
          <span>Send Direct Message</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onAddNode('reply-comment')}>
          <Reply className="mr-2 h-4 w-4" />
          <span>Reply to Comment</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onAddNode('follow-user')}>
          <UserPlus className="mr-2 h-4 w-4" />
          <span>Follow User</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}