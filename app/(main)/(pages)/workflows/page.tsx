"use client"
import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Plus, MoreVertical, Edit, Copy, Trash2, Play, Pause } from "lucide-react"
import Link from "next/link"

// Define workflow status types
type WorkflowStatus = "active" | "draft" | "paused"

// Define workflow data structure
interface Workflow {
    id: string
    name: string
    description: string
    status: WorkflowStatus
    triggers: number
    actions: number
    lastEdited: string
    createdBy: string
}

const WorkflowsPage = () => {
    // State for dialog
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [newWorkflowName, setNewWorkflowName] = useState("")
    const [newWorkflowDescription, setNewWorkflowDescription] = useState("")

    // Hardcoded workflow data
    const workflows: Workflow[] = [
        {
            id: "wf-001",
            name: "New Follower Welcome",
            description: "Send a welcome message to new Instagram followers",
            status: "active",
            triggers: 1,
            actions: 3,
            lastEdited: "2023-11-15T14:30:00Z",
            createdBy: "Steve Johnson"
        },
        {
            id: "wf-002",
            name: "Comment Response",
            description: "Auto-reply to comments with specific keywords",
            status: "active",
            triggers: 1,
            actions: 2,
            lastEdited: "2023-11-10T09:15:00Z",
            createdBy: "Steve Johnson"
        },
        {
            id: "wf-003",
            name: "Content Scheduler",
            description: "Schedule posts based on engagement metrics",
            status: "draft",
            triggers: 2,
            actions: 4,
            lastEdited: "2023-11-05T16:45:00Z",
            createdBy: "Alex Wong"
        },
        {
            id: "wf-004",
            name: "Engagement Booster",
            description: "Like and comment on posts from target audience",
            status: "paused",
            triggers: 1,
            actions: 5,
            lastEdited: "2023-10-28T11:20:00Z",
            createdBy: "Steve Johnson"
        },
        {
            id: "wf-005",
            name: "Hashtag Monitor",
            description: "Track and engage with trending hashtags",
            status: "draft",
            triggers: 1,
            actions: 2,
            lastEdited: "2023-10-20T13:10:00Z",
            createdBy: "Maria Garcia"
        }
    ]

    // Function to format date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        }).format(date)
    }

    // Function to render status badge with appropriate color
    const renderStatusBadge = (status: WorkflowStatus) => {
        switch (status) {
            case "active":
                return <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>
            case "draft":
                return <Badge variant="outline" className="text-muted-foreground">Draft</Badge>
            case "paused":
                return <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-200">Paused</Badge>
            default:
                return <Badge>{status}</Badge>
        }
    }

    // Function to handle workflow creation
    const handleCreateWorkflow = () => {
        // Here you would typically save the new workflow to your backend
        console.log("Creating new workflow:", {
            name: newWorkflowName,
            description: newWorkflowDescription
        })

        // Reset form and close dialog
        setNewWorkflowName("")
        setNewWorkflowDescription("")
        setIsDialogOpen(false)
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Workflows</h1>
                    <p className="text-muted-foreground mt-1">Manage your automated workflows</p>
                </div>

                {/* Create Workflow Dialog */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Create Workflow
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Create New Workflow</DialogTitle>
                            <DialogDescription>
                                Set up a new automated workflow. Fill in the details below to get started.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Workflow Name</Label>
                                <Input
                                    id="name"
                                    placeholder="Enter workflow name"
                                    value={newWorkflowName}
                                    onChange={(e) => setNewWorkflowName(e.target.value)}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Describe what this workflow does"
                                    value={newWorkflowDescription}
                                    onChange={(e) => setNewWorkflowDescription(e.target.value)}
                                />
                                <p className="text-xs text-muted-foreground">
                                    You'll be able to add triggers and actions after creating the workflow.
                                </p>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button
                                onClick={handleCreateWorkflow}
                                disabled={!newWorkflowName}
                            >
                                Create Workflow
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle>All Workflows</CardTitle>
                    <CardDescription>
                        You have {workflows.length} workflows in total
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[250px]">Name</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Triggers</TableHead>
                                <TableHead>Actions</TableHead>
                                <TableHead>Last Edited</TableHead>
                                <TableHead>Created By</TableHead>
                                <TableHead className="text-right">Options</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {workflows.map((workflow) => (
                                <TableRow key={workflow.id}>
                                    <TableCell className="font-medium">
                                        <div>
                                            <Link href={`/workflows/${workflow.id}`} className="hover:underline font-medium">
                                                {workflow.name}
                                            </Link>
                                            <p className="text-xs text-muted-foreground mt-1">{workflow.description}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>{renderStatusBadge(workflow.status)}</TableCell>
                                    <TableCell>{workflow.triggers}</TableCell>
                                    <TableCell>{workflow.actions}</TableCell>
                                    <TableCell>{formatDate(workflow.lastEdited)}</TableCell>
                                    <TableCell>{workflow.createdBy}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreVertical className="h-4 w-4" />
                                                    <span className="sr-only">Open menu</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem>
                                                    <Edit className="mr-2 h-4 w-4" /> Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    <Copy className="mr-2 h-4 w-4" /> Duplicate
                                                </DropdownMenuItem>
                                                {workflow.status === "active" ? (
                                                    <DropdownMenuItem>
                                                        <Pause className="mr-2 h-4 w-4" /> Pause
                                                    </DropdownMenuItem>
                                                ) : (
                                                    <DropdownMenuItem>
                                                        <Play className="mr-2 h-4 w-4" /> Activate
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-destructive">
                                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}

export default WorkflowsPage