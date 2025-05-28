import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    console.log("Received data for node creation:", data);

    // Validate required fields
    if (!data.workflowId) {
      return NextResponse.json(
        { error: "Workflow ID is required" },
        { status: 400 }
      );
    }

    if (!data.type) {
      return NextResponse.json(
        { error: "Node type is required" },
        { status: 400 }
      );
    }

    // Extract config data if provided
    const { config, ...nodeData } = data;

    // Create the node
    const node = await prisma.node.create({
      data: {
        workflowId: data.workflowId,
        type: data.type,
        label: data.label || "",
        positionX: data.positionX || 0,
        positionY: data.positionY || 0,
        // Create the node config if provided
        ...(config && {
          config: {
            create: {
              config: config
            }
          }
        })
      },
      include: {
        config: true
      }
    });

    // Update the workflow's trigger or action count based on the node type
    if (data.type === 'TRIGGER') {
      await prisma.workflow.update({
        where: { id: data.workflowId },
        data: { triggersCount: { increment: 1 } }
      });
    } else if (data.type === 'ACTION') {
      await prisma.workflow.update({
        where: { id: data.workflowId },
        data: { actionsCount: { increment: 1 } }
      });
    }

    return NextResponse.json(node, { status: 201 });
  } catch (error) {
    console.error("Error creating node:", error);
    return NextResponse.json(
      { error: "Failed to create node" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get the workflow ID from the query parameters
    const url = new URL(request.url);
    const workflowId = url.searchParams.get('workflowId');

    if (!workflowId) {
      return NextResponse.json(
        { error: "Workflow ID is required" },
        { status: 400 }
      );
    }

    // Fetch all nodes for the specified workflow
    const nodes = await prisma.node.findMany({
      where: { workflowId },
      include: { config: true }
    });

    return NextResponse.json(nodes);
  } catch (error) {
    console.error("Error fetching nodes:", error);
    return NextResponse.json(
      { error: "Failed to fetch nodes" },
      { status: 500 }
    );
  }
}