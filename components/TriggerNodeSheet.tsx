import React, { useState } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "./ui/sheet";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Instagram, UserPlus, MessageSquare, Heart, MessageCircle } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";

interface TriggerNodeSheetProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    label: string;
    triggerType?: string;
    description?: string;
  };
  onUpdate: (updatedData: any) => void;
}

export default function TriggerNodeSheet({ 
  isOpen, 
  onClose, 
  data,
  onUpdate
}: TriggerNodeSheetProps) {
  const [triggerType, setTriggerType] = useState(data.triggerType || "follow");
  
  const handleSave = () => {
    let label = "Instagram Trigger";
    let description = "";
    
    switch (triggerType) {
      case "follow":
        label = "New Follower";
        description = "When a user follows your account";
        break;
      case "comment":
        label = "New Comment";
        description = "When a user comments on your post";
        break;
      case "like":
        label = "New Like";
        description = "When a user likes your post";
        break;
      case "direct-message":
        label = "New Direct Message";
        description = "When a user sends you a DM";
        break;
    }
    
    onUpdate({ 
      ...data,
      label,
      triggerType,
      description
    });
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Configure Trigger</SheetTitle>
          <SheetDescription>
            Choose what event will trigger this Instagram workflow.
          </SheetDescription>
        </SheetHeader>
        
        <div className="space-y-6 py-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-2 rounded-lg">
              <Instagram className="text-white size-5" />
            </div>
            <div className="font-medium text-lg">Instagram Trigger</div>
          </div>
          
          <div className="space-y-4">
            <Label>Select Trigger Event</Label>
            <RadioGroup value={triggerType} onValueChange={setTriggerType} className="space-y-3">
              <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="follow" id="follow" />
                <Label htmlFor="follow" className="flex items-center gap-2 cursor-pointer">
                  <UserPlus className="h-4 w-4" />
                  <div>
                    <div className="font-medium">New Follower</div>
                    <div className="text-sm text-muted-foreground">When someone follows your account</div>
                  </div>
                </Label>
              </div>
              
              <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="comment" id="comment" />
                <Label htmlFor="comment" className="flex items-center gap-2 cursor-pointer">
                  <MessageSquare className="h-4 w-4" />
                  <div>
                    <div className="font-medium">New Comment</div>
                    <div className="text-sm text-muted-foreground">When someone comments on your post</div>
                  </div>
                </Label>
              </div>
              
              <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="like" id="like" />
                <Label htmlFor="like" className="flex items-center gap-2 cursor-pointer">
                  <Heart className="h-4 w-4" />
                  <div>
                    <div className="font-medium">New Like</div>
                    <div className="text-sm text-muted-foreground">When someone likes your post</div>
                  </div>
                </Label>
              </div>
              
              <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="direct-message" id="direct-message" />
                <Label htmlFor="direct-message" className="flex items-center gap-2 cursor-pointer">
                  <MessageCircle className="h-4 w-4" />
                  <div>
                    <div className="font-medium">New Direct Message</div>
                    <div className="text-sm text-muted-foreground">When someone sends you a DM</div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}