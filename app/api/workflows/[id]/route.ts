import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const workflowId = params.id
    
    if (!workflowId) {
      return NextResponse.json(
        { error: 'Workflow ID is required' },
        { status: 400 }
      )
    }

    // Fetch the workflow
    const workflow = await prisma.workflow.findUnique({
      where: {
        id: workflowId,
      },
    })

    if (!workflow) {
      return NextResponse.json(
        { error: 'Workflow not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(workflow)
  } catch (error) {
    console.error('Error fetching workflow:', error)
    return NextResponse.json(
      { error: 'Failed to fetch workflow' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const workflowId = params.id
    const body = await request.json()
    
    if (!workflowId) {
      return NextResponse.json(
        { error: 'Workflow ID is required' },
        { status: 400 }
      )
    }

    // Update the workflow
    const workflow = await prisma.workflow.update({
      where: {
        id: workflowId,
      },
      data: {
        name: body.name,
        description: body.description,
        status: body.status,
        lastEdited: new Date(),
      },
    })

    return NextResponse.json(workflow)
  } catch (error) {
    console.error('Error updating workflow:', error)
    return NextResponse.json(
      { error: 'Failed to update workflow' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const workflowId = params.id
    
    if (!workflowId) {
      return NextResponse.json(
        { error: 'Workflow ID is required' },
        { status: 400 }
      )
    }

    // Delete the workflow (this will cascade delete nodes and edges)
    await prisma.workflow.delete({
      where: {
        id: workflowId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting workflow:', error)
    return NextResponse.json(
      { error: 'Failed to delete workflow' },
      { status: 500 }
    )
  }
}