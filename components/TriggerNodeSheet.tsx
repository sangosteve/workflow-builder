import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle
} from "./ui/sheet";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { toast } from "sonner";
import {
  ChevronsUpDown,
  Search,
  UserPlus,
  MessageSquare,
  Heart,
  MessageCircle,
  Tag,
  List,
  Users,
  Bell
} from "lucide-react";
import { Input } from "./ui/input";
import {
  Command,
  CommandEmpty,
  CommandItem,
  CommandList,
} from "./ui/command";
import { useUpdateNode } from "@/lib/api-hooks";

// Define the structure for trigger node data
interface TriggerNodeData {
  id?: string;
  label?: string;
  triggerType?: string;
  description?: string;
  workflowId?: string;
  category?: string;
  type?: string;
}

interface TriggerNodeSheetProps {
  isOpen: boolean;
  onClose: () => void;
  data: TriggerNodeData;
  onUpdate: (data: TriggerNodeData) => void;
}

// Define trigger event options with categories and icons
const triggerEvents = [
  {
    value: "follow",
    label: "New Follower",
    description: "When someone follows your account",
    category: "Account",
    type: "Instant",
    icon: UserPlus
  },
  {
    value: "comment",
    label: "New Comment",
    description: "When someone comments on your post",
    category: "Engagement",
    type: "Instant",
    icon: MessageSquare
  },
  {
    value: "like",
    label: "New Like",
    description: "When someone likes your post",
    category: "Engagement",
    type: "Instant",
    icon: Heart
  },
  {
    value: "direct-message",
    label: "New Direct Message",
    description: "When someone sends you a direct message",
    category: "Messages",
    type: "Instant",
    icon: MessageCircle
  },
  {
    value: "hashtag-mention",
    label: "Hashtag Mention",
    description: "When your specified hashtag is used in a post",
    category: "Mentions",
    type: "Polling",
    icon: Tag
  },
  {
    value: "post-by-account",
    label: "New Post by Account",
    description: "When a specific account posts new content",
    category: "Monitoring",
    type: "Polling",
    icon: List
  },
  {
    value: "follower-milestone",
    label: "Follower Milestone",
    description: "When you reach a follower milestone",
    category: "Account",
    type: "Polling",
    icon: Users
  },
  {
    value: "engagement-spike",
    label: "Engagement Spike",
    description: "When there's a sudden increase in engagement",
    category: "Analytics",
    type: "Polling",
    icon: Bell
  }
];

export default function TriggerNodeSheet({
  isOpen,
  onClose,
  data,
  onUpdate
}: TriggerNodeSheetProps) {
  // Remove the underscore prefix since we're not using these variables directly
  // We'll keep the state variables but remove the unused ones from the component
  const [triggerType, setTriggerType] = useState(data.triggerType || "");
  const [searchQuery, setSearchQuery] = useState("");
  const [comboboxOpen, setComboboxOpen] = useState(false);

  // Use the useUpdateNode hook
  const updateNodeMutation = useUpdateNode();
  const isLoading = updateNodeMutation.isPending;

  // Get the selected trigger event details
  const selectedTrigger = triggerEvents.find(event => event.value === triggerType);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Get the selected trigger event details
    const selectedEvent = triggerEvents.find(event => event.value === triggerType);

    if (!selectedEvent) {
      toast.error("Please select a valid trigger event");
      return;
    }

    const updatedData: TriggerNodeData = {
      ...data, // Keep existing data like ID and workflowId
      label: selectedEvent.label,
      triggerType,
      description: selectedEvent.description,
      category: selectedEvent.category,
      type: selectedEvent.type
    };

    try {
      console.log("Node ID for update:", data.id);

      // If we have a node ID, update it via API
      if (data.id) {
        await updateNodeMutation.mutateAsync({
          id: data.id,
          data: {
            label: updatedData.label,
            type: "TRIGGER",
            config: {
              triggerType,
              description: updatedData.description,
              category: updatedData.category,
              triggerEventType: updatedData.type // "Instant" or "Polling"
            }
          }
        });

        toast.success("Trigger node updated successfully");
      } else {
        console.warn("No node ID provided, skipping database update");
      }

      // Update the node in the React Flow instance
      onUpdate(updatedData);
      onClose();
    } catch (error) {
      console.error("Error updating node:", error);
      toast.error(`Failed to update trigger node: ${(error as Error).message}`);
    }
  };

  // Filter events based on search query
  const filteredEvents = searchQuery
    ? triggerEvents.filter(event =>
      event.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : triggerEvents;

  if (!isOpen) return null;

  return (
    <Sheet defaultOpen={true} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Edit Trigger</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-6">
          <div className="space-y-2">
            <Label htmlFor="triggerType">Select Trigger Event</Label>
            <Popover open={searchQuery.length > 0 || comboboxOpen} onOpenChange={setComboboxOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={comboboxOpen}
                  className="w-full justify-between"
                >
                  {triggerType && selectedTrigger ? (
                    <div className="flex items-center">
                      {selectedTrigger.icon && <selectedTrigger.icon className="mr-2 h-4 w-4" />}
                      {selectedTrigger.label}
                    </div>
                  ) : (
                    "Choose an event"
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <div className="flex items-center border-b px-3 py-2">
                  <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                  <Input
                    placeholder="Search events"
                    className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Command>
                  <CommandList>
                    <CommandEmpty>No trigger event found.</CommandEmpty>
                    {filteredEvents.map((event) => (
                      <CommandItem
                        key={event.value}
                        value={event.value}
                        onSelect={(value) => {
                          setTriggerType(value);
                          setSearchQuery("");
                          setComboboxOpen(false);
                        }}
                        className="flex flex-col items-start py-2 px-3 cursor-pointer"
                      >
                        <div className="flex w-full items-center justify-between">
                          <div className="flex items-center font-medium">
                            {event.icon && <event.icon className="mr-2 h-4 w-4 text-muted-foreground" />}
                            {event.label}
                          </div>
                          <div className={`text-xs px-2 py-0.5 rounded-full ${event.type === "Instant"
                            ? "bg-green-100 text-green-800"
                            : "bg-amber-100 text-amber-800"
                            }`}>
                            {event.type}
                          </div>
                        </div>
                        <div className="text-[9px] text-muted-foreground mt-0.5">
                          {event.description}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !triggerType}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}