import React, { useState } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "./ui/sheet";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { MessageCircle, Reply, UserPlus } from "lucide-react";
import { Textarea } from "./ui/textarea";

interface ActionNodeSheetProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    label: string;
    status?: string;
    actionType?: string;
    message?: string;
  };
  onUpdate: (updatedData: any) => void;
}

export default function ActionNodeSheet({ 
  isOpen, 
  onClose, 
  data,
  onUpdate
}: ActionNodeSheetProps) {
  const [message, setMessage] = useState(data.message || "");
  
  const handleSave = () => {
    onUpdate({ 
      ...data,
      message,
      status: message ? message.substring(0, 30) + (message.length > 30 ? "..." : "") : "Message to be sent"
    });
    onClose();
  };

  const renderContent = () => {
    switch (data.actionType) {
      case 'direct-message':
        return (
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-2 rounded-lg">
                <MessageCircle className="text-white size-5" />
              </div>
              <div className="font-medium text-lg">Send Direct Message</div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="message">Message Content</Label>
              <Textarea
                id="message"
                placeholder="Enter your message here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-[120px]"
              />
              <p className="text-xs text-muted-foreground">
                This message will be sent as a direct message to the user who triggered this workflow.
              </p>
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button onClick={handleSave}>Save Changes</Button>
            </div>
          </div>
        );
      
      case 'reply-comment':
        return (
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-2 rounded-lg">
                <Reply className="text-white size-5" />
              </div>
              <div className="font-medium text-lg">Reply to Comment</div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reply">Reply Content</Label>
              <Textarea
                id="reply"
                placeholder="Enter your reply here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-[120px]"
              />
              <p className="text-xs text-muted-foreground">
                This reply will be posted as a comment in response to the user's comment.
              </p>
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button onClick={handleSave}>Save Changes</Button>
            </div>
          </div>
        );
      
      case 'follow-user':
        return (
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-2 rounded-lg">
                <UserPlus className="text-white size-5" />
              </div>
              <div className="font-medium text-lg">Follow User</div>
            </div>
            
            <p className="text-sm">
              This action will automatically follow the user who triggered this workflow.
            </p>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button onClick={onClose}>Close</Button>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="py-4">
            <p>Configure your Instagram action</p>
          </div>
        );
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Configure Action</SheetTitle>
          <SheetDescription>
            Customize how this Instagram action will behave in your workflow.
          </SheetDescription>
        </SheetHeader>
        {renderContent()}
      </SheetContent>
    </Sheet>
  );
}