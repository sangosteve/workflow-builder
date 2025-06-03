import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// For CORS preflight requests
export async function OPTIONS() {
  return new NextResponse(null, { 
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

// Match the pattern used in other route handlers
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const workflowId = params.id;
    
    // Check if workflow exists and is active
    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
      include: {
        nodes: {
          include: {
            config: true,
          },
        },
        edges: true,
      },
    });

    if (!workflow) {
      return NextResponse.json(
        { error: "Workflow not found" },
        { status: 404 }
      );
    }

    if (workflow.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Cannot execute workflow that is not active" },
        { status: 400 }
      );
    }

    // Create a new workflow run
    const workflowRun = await prisma.workflowRun.create({
      data: {
        workflowId,
        status: "RUNNING",
      },
    });

    // Find trigger nodes (entry points)
    const triggerNodes = workflow.nodes.filter(
      (node) => node.type === "TRIGGER"
    );

    if (triggerNodes.length === 0) {
      // Update run status to FAILED if no trigger nodes
      await prisma.workflowRun.update({
        where: { id: workflowRun.id },
        data: { status: "FAILED", completedAt: new Date() },
      });

      return NextResponse.json(
        { error: "No trigger nodes found in workflow" },
        { status: 400 }
      );
    }

    // Return success response with the created workflow run
    return NextResponse.json({
      message: "Workflow execution started",
      runId: workflowRun.id
    });
    
  } catch (error) {
    console.error("Error executing workflow:", error);
    return NextResponse.json(
      { error: "Failed to execute workflow", details: (error as Error).message },
      { status: 500 }
    );
  }
}