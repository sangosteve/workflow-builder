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

		// If positionX and positionY are not provided or are zero, calculate them
		if (!data.positionX || !data.positionY) {
			// Find the last node in this workflow to position the new one below it
			const lastNode = await prisma.node.findFirst({
				where: { workflowId: data.workflowId },
				orderBy: { positionY: "desc" },
			});

			// Default X position is 100
			data.positionX = 100;

			// If there's a previous node, position this one 200 units below it
			// Otherwise, start at Y=100
			data.positionY = lastNode ? lastNode.positionY + 200 : 100;

			console.log(
				`Calculated position for new node: (${data.positionX}, ${data.positionY})`
			);
		}

		// Extract config data if provided
		const { config } = data;

		// Create the node
		const node = await prisma.node.create({
			data: {
				workflowId: data.workflowId,
				type: data.type,
				label: data.label || "",
				positionX: data.positionX,
				positionY: data.positionY,
				// Create the node config if provided
				...(config && {
					config: {
						create: {
							config: config,
						},
					},
				}),
			},
			include: {
				config: true,
			},
		});

		// Update the workflow's trigger or action count based on the node type
		if (data.type === "TRIGGER") {
			await prisma.workflow.update({
				where: { id: data.workflowId },
				data: { triggersCount: { increment: 1 } },
			});
		} else if (data.type === "ACTION") {
			await prisma.workflow.update({
				where: { id: data.workflowId },
				data: { actionsCount: { increment: 1 } },
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
		const workflowId = url.searchParams.get("workflowId");

		if (!workflowId) {
			return NextResponse.json(
				{ error: "Workflow ID is required" },
				{ status: 400 }
			);
		}

		// Fetch all nodes for the specified workflow
		const nodes = await prisma.node.findMany({
			where: { workflowId },
			include: { config: true },
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
