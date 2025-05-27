import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, description } = body
    
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