import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const workflowId = params.id;
    
    if (!workflowId) {
      return NextResponse.json(
        { error: 'Workflow ID is required' },
        { status: 400 }
      )
    }
    
    // Fetch all edges for the workflow
    const edges = await prisma.edge.findMany({
      where: {
        workflowId: workflowId,
      },
    })
    
    return NextResponse.json(edges)
  } catch (error) {
    console.error('Error fetching workflow edges:', error)
    return NextResponse.json(
      { error: 'Failed to fetch workflow edges' },
      { status: 500 }
    )
  }
}