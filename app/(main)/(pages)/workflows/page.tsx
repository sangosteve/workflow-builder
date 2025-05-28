"use client"
import React, { useState, useEffect } from 'react'
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
import { Plus, MoreVertical, Edit, Copy, Trash2, Play, Pause, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

// Define workflow status types
type WorkflowStatus = "ACTIVE" | "DRAFT" | "PAUSED"

// Define workflow data structure
interface Workflow {
    id: string
    name: string
    description: string | null
    status: WorkflowStatus
    triggersCount: number
    actionsCount: number
    lastEdited: string
    createdAt: string
}

const WorkflowsPage = () => {
    const router = useRouter()
    // State for dialog
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [newWorkflowName, setNewWorkflowName] = useState("")
    const [newWorkflowDescription, setNewWorkflowDescription] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [isCreating, setIsCreating] = useState(false)
    const [workflows, setWorkflows] = useState<Workflow[]>([])

    // Fetch workflows on component mount
    useEffect(() => {
        fetchWorkflows()
    }, [])

    // Function to fetch workflows from API
    const fetchWorkflows = async () => {
        setIsLoading(true)
        try {
            const response = await fetch('/api/workflows')
            if (!response.ok) {
                throw new Error('Failed to fetch workflows')
            }
            const data = await response.json()
            setWorkflows(data)
        } catch (error) {
            console.error('Error fetching workflows:', error)
        } finally {
            setIsLoading(false)
        }
    }

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
            case "ACTIVE":
                return <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>
            case "DRAFT":
                return <Badge variant="outline" className="text-muted-foreground">Draft</Badge>
            case "PAUSED":
                return <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-200">Paused</Badge>
            default:
                return <Badge>{status}</Badge>
        }
    }

    // Function to handle workflow creation
    const handleCreateWorkflow = async () => {
        if (!newWorkflowName) return
        
        setIsCreating(true)
        try {
            const response = await fetch('/api/workflows', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: newWorkflowName,
                    description: newWorkflowDescription,
                    createDefaultTrigger: true, // Add this flag to indicate we want a default trigger node
                }),
            })

            if (!response.ok) {
                throw new Error('Failed to create workflow')
            }

            const newWorkflow = await response.json()
            
            // Refresh workflows list
            await fetchWorkflows()
            
            // Reset form and close dialog
            setNewWorkflowName("")
            setNewWorkflowDescription("")
            setIsDialogOpen(false)
            
            // Navigate to the new workflow editor
            router.push(`/workflows/${newWorkflow.id}`)
        } catch (error) {
            console.error('Error creating workflow:', error)
        } finally {
            setIsCreating(false)
        }
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
                                disabled={!newWorkflowName || isCreating}
                            >
                                {isCreating ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    'Create Workflow'
                                )}
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
                    {isLoading ? (
                        <div className="flex justify-center items-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : workflows.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <p>No workflows found. Create your first workflow to get started.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[250px]">Name</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Triggers</TableHead>
                                    <TableHead>Actions</TableHead>
                                    <TableHead>Last Edited</TableHead>
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
                                        <TableCell>{workflow.triggersCount}</TableCell>
                                        <TableCell>{workflow.actionsCount}</TableCell>
                                        <TableCell>{formatDate(workflow.lastEdited)}</TableCell>
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
                                                    {workflow.status === "ACTIVE" ? (
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
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

export default WorkflowsPage