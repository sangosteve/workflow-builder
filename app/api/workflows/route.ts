import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, description, createDefaultTrigger } = body
    
    if (!name) {
      return NextResponse.json(
        { error: 'Workflow name is required' },
        { status: 400 }
      )
    }
    
    const workflow = await prisma.workflow.create({
      data: {
        name,
        description: description || '',
        status: 'DRAFT',
        lastEdited: new Date(),
      },
    })
    
    // If createDefaultTrigger flag is true, create a default trigger node
    if (createDefaultTrigger) {
      // Create the node with its config in a single operation
      await prisma.node.create({
        data: {
          workflowId: workflow.id,
          type: 'TRIGGER',
          label: 'Trigger',
          positionX: 100,
          positionY: 50,
          config: {
            create: {
              // Use the config field which is of type Json
              config: {
                triggerType: '',
                description: 'Configure this trigger to start your workflow',
              }
            }
          }
        }
      });
      
      // Update the triggersCount in the workflow
      await prisma.workflow.update({
        where: { id: workflow.id },
        data: { triggersCount: 1 }
      });
    }
    
    return NextResponse.json(workflow, { status: 201 })
  } catch (error) {
    console.error('Error creating workflow:', error)
    return NextResponse.json(
      { error: 'Failed to create workflow' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const workflows = await prisma.workflow.findMany({
      orderBy: {
        lastEdited: 'desc',
      },
    })
    
    return NextResponse.json(workflows)
  } catch (error) {
    console.error('Error fetching workflows:', error)
    return NextResponse.json(
      { error: 'Failed to fetch workflows' },
      { status: 500 }
    )
  }
}