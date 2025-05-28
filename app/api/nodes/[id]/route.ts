import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const nodeId = params.id;
		const data = await request.json();
		console.log("Received data for node update:", data);

		// First, check if the node exists
		const existingNode = await prisma.node.findUnique({
			where: { id: nodeId },
			include: { config: true },
		});

		if (!existingNode) {
			return NextResponse.json({ error: "Node not found" }, { status: 404 });
		}

		// Update the node with basic information
		const updatedNode = await prisma.node.update({
			where: { id: nodeId },
			data: {
				label: data.label,
				type: data.type,
				// Add any other node fields you want to update
			},
		});

		// Update or create node configuration
		let nodeConfig;
		if (existingNode.config) {
			// Update existing config
			nodeConfig = await prisma.nodeConfig.update({
				where: { nodeId },
				data: {
					config: data.config || {},
				},
			});
		} else {
			// Create new config if it doesn't exist
			nodeConfig = await prisma.nodeConfig.create({
				data: {
					nodeId,
					config: data.config || {},
				},
			});
		}

		return NextResponse.json({
			node: updatedNode,
			config: nodeConfig,
		});
	} catch (error) {
		console.error("Error updating node:", error);
		return NextResponse.json(
			{ error: "Failed to update node" },
			{ status: 500 }
		);
	}
}
