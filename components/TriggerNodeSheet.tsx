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

interface TriggerNodeSheetProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    id?: string;
    label?: string;
    triggerType?: string;
    description?: string;
  };
  onUpdate: (data: any) => void;
}

// Define trigger event options with categories and icons
const triggerEvents = [
  // Instagram triggers
  {
    value: "follow",
    label: "New Follower",
    description: "Triggers when someone follows your account.",
    category: "Instagram",
    type: "Instant",
    icon: UserPlus
  },
  {
    value: "comment",
    label: "New Comment",
    description: "Triggers when someone comments on your post.",
    category: "Instagram",
    type: "Polling",
    icon: MessageSquare
  },
  {
    value: "like",
    label: "New Like",
    description: "Triggers when someone likes your post.",
    category: "Instagram",
    type: "Polling",
    icon: Heart
  },
  {
    value: "direct-message",
    label: "New Direct Message",
    description: "Triggers when you receive a direct message.",
    category: "Instagram",
    type: "Polling",
    icon: MessageCircle
  },

  // Trello-like triggers
  {
    value: "new-label",
    label: "New Label",
    description: "Triggers when a new label is created.",
    category: "Trello",
    type: "Polling",
    icon: Tag
  },
  {
    value: "label-added-to-card",
    label: "New Label Added to Card",
    description: "Triggers when a label is added in a card.",
    category: "Trello",
    type: "Instant",
    icon: Tag
  },
  {
    value: "new-list",
    label: "New List",
    description: "Triggers when a new list on a board is added.",
    category: "Trello",
    type: "Polling",
    icon: List
  },
  {
    value: "new-member",
    label: "New Member on Board",
    description: "Triggers when a new member joins a board.",
    category: "Trello",
    type: "Polling",
    icon: Users
  },
  {
    value: "new-notification",
    label: "New Notification",
    description: "Triggers when you get a new notification.",
    category: "Trello",
    type: "Polling",
    icon: Bell
  },
];

export default function TriggerNodeSheet({
  isOpen,
  onClose,
  data,
  onUpdate
}: TriggerNodeSheetProps) {
  const [label, setLabel] = useState(data.label || "");
  const [triggerType, setTriggerType] = useState(data.triggerType || "");
  const [description, setDescription] = useState(data.description || "");
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [comboboxOpen, setComboboxOpen] = useState(false);

  // Get the selected trigger event details
  const selectedTrigger = triggerEvents.find(event => event.value === triggerType);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Get the selected trigger event details
    const selectedEvent = triggerEvents.find(event => event.value === triggerType);

    if (!selectedEvent) {
      toast.error("Please select a valid trigger event");
      setIsLoading(false);
      return;
    }

    const updatedData = {
      label: selectedEvent.label,
      triggerType,
      description: selectedEvent.description,
      category: selectedEvent.category,
      type: selectedEvent.type
    };

    try {
      console.log("data id:", data.id);
      // If we have a node ID in the database, update it via API
      if (data.id) {
        const response = await fetch(`/api/nodes/${data.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            label: updatedData.label,
            type: "TRIGGER",
            config: {
              triggerType,
              description: updatedData.description,
              category: updatedData.category,
              triggerEventType: updatedData.type // "Instant" or "Polling"
            }
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to update node");
        }
      }

      // Update the node in the React Flow instance
      onUpdate(updatedData);

      toast.success("Trigger node updated successfully");
      onClose();
    } catch (error) {
      console.error("Error updating node:", error);
      toast.error(`Failed to update trigger node: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
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
                          // Auto-fill label and description based on the selected trigger
                          const selectedEvent = triggerEvents.find(e => e.value === value);
                          if (selectedEvent) {
                            setLabel(selectedEvent.label);
                            setDescription(selectedEvent.description);
                          }
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