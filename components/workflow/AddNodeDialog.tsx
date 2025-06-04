import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Play, GitBranch, MessageCircle, Reply, UserPlus, Clock, Database } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

interface NodeOption {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  category: string;
}

interface AddNodeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectNode: (nodeType: string) => void;
}

export default function AddNodeDialog({ isOpen, onClose, onSelectNode }: AddNodeDialogProps) {
  const [activeTab, setActiveTab] = useState('action');

  const actionNodes: NodeOption[] = [
    {
      id: 'direct-message',
      name: 'Send Direct Message',
      description: 'Send a direct message to the user who triggered this workflow',
      icon: MessageCircle,
      category: 'Communication'
    },
    {
      id: 'reply-comment',
      name: 'Reply to Comment',
      description: 'Post a reply to the comment that triggered this workflow',
      icon: Reply,
      category: 'Communication'
    },
    {
      id: 'follow-user',
      name: 'Follow User',
      description: 'Follow the user who triggered this workflow',
      icon: UserPlus,
      category: 'Engagement'
    },
    // You can add more action types here as needed
  ];

  const conditionNodes: NodeOption[] = [
    {
      id: 'if-condition',
      name: 'If/Then',
      description: 'Execute actions based on true/false condition',
      icon: GitBranch,
      category: 'Logic'
    },
    {
      id: 'time-condition',
      name: 'Time Condition',
      description: 'Check if the current time meets specific criteria',
      icon: Clock,
      category: 'Time'
    },
    {
      id: 'data-condition',
      name: 'Data Condition',
      description: 'Check if specific data exists or matches criteria',
      icon: Database,
      category: 'Data'
    },
    // You can add more condition types here as needed
  ];

  const handleNodeSelect = (nodeId: string) => {
    onSelectNode(nodeId);
    onClose();
  };

  const NodeCard = ({ node }: { node: NodeOption }) => {
    const IconComponent = node.icon;
    return (
      <div
        onClick={() => handleNodeSelect(node.id)}
        className="p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 hover:shadow-md transition-all duration-200 group"
      >
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-500 transition-colors">
              <IconComponent className="w-5 h-5 text-blue-600 group-hover:text-white" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                {node.name}
              </h3>
              <Badge variant="outline" className="text-xs">
                {node.category}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-gray-500 line-clamp-2">
              {node.description}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Add Node to Workflow</DialogTitle>
          <DialogDescription>
            Choose a node type to add to your workflow
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="action" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="action" className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              <span>Actions</span>
              <span className="bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                {actionNodes.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="condition" className="flex items-center gap-2">
              <GitBranch className="h-4 w-4" />
              <span>Conditions</span>
              <span className="bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                {conditionNodes.length}
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="action" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto p-1">
              {actionNodes.map((node) => (
                <NodeCard key={node.id} node={node} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="condition" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto p-1">
              {conditionNodes.map((node) => (
                <NodeCard key={node.id} node={node} />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Select a node type to add it to your workflow
          </p>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}