import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const nodeId = params.id;
    const data = await request.json();
    console.log(`Updating node ${nodeId} with data:`, data);

    if (!nodeId) {
      return NextResponse.json(
        { error: "Node ID is required" },
        { status: 400 }
      );
    }

    // Extract the basic node properties and config separately
    const { label, type, config } = data;
    
    // First, update the basic node properties
    const updatedNode = await prisma.node.update({
      where: { id: nodeId },
      data: {
        label: label || undefined,
        type: type || undefined,
      },
      include: {
        config: true
      }
    });

    // Then, handle the config separately using upsert to either update or create
    let nodeConfig = null;
    if (config) {
      nodeConfig = await prisma.nodeConfig.upsert({
        where: { nodeId },
        update: { config },
        create: {
          nodeId,
          config
        }
      });
    }

    // Combine the node and its config for the response
    const responseNode = {
      ...updatedNode,
      config: nodeConfig ? nodeConfig.config : updatedNode.config?.config || null
    };

    return NextResponse.json(responseNode);
  } catch (error) {
    console.error(`Error updating node:`, error);
    return NextResponse.json(
      { error: `Failed to update node: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const nodeId = params.id;

    if (!nodeId) {
      return NextResponse.json(
        { error: "Node ID is required" },
        { status: 400 }
      );
    }

    const node = await prisma.node.findUnique({
      where: { id: nodeId },
      include: {
        config: true
      }
    });

    if (!node) {
      return NextResponse.json(
        { error: "Node not found" },
        { status: 404 }
      );
    }

    // Format the response to include the config directly
    const responseNode = {
      ...node,
      config: node.config?.config || null
    };

    return NextResponse.json(responseNode);
  } catch (error) {
    console.error(`Error fetching node:`, error);
    return NextResponse.json(
      { error: "Failed to fetch node" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const nodeId = params.id;

    if (!nodeId) {
      return NextResponse.json(
        { error: "Node ID is required" },
        { status: 400 }
      );
    }

    // Delete all edges connected to this node
    await prisma.edge.deleteMany({
      where: {
        OR: [
          { sourceNodeId: nodeId },
          { targetNodeId: nodeId },
        ],
      },
    });

    // The NodeConfig will be automatically deleted due to the onDelete: Cascade relation

    // Delete the node
    const deletedNode = await prisma.node.delete({
      where: { id: nodeId },
    });

    return NextResponse.json(deletedNode);
  } catch (error) {
    console.error(`Error deleting node:`, error);
    return NextResponse.json(
      { error: "Failed to delete node" },
      { status: 500 }
    );
  }
}