import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
	request: Request,
	context: { params: Promise<{ id: string }> }
) {
	try {
		const params = await context.params;
		const workflowId = params.id;

		console.log("Fetching nodes for workflow ID:", workflowId);

		if (!workflowId) {
			return NextResponse.json(
				{ error: "Workflow ID is required" },
				{ status: 400 }
			);
		}

		// Fetch all nodes for the workflow with their configs
		const nodes = await prisma.node.findMany({
			where: {
				workflowId: workflowId,
			},
			include: {
				config: true,
			},
		});

		return NextResponse.json(nodes);
	} catch (error) {
		console.error("Error fetching workflow nodes:", error);
		return NextResponse.json(
			{ error: "Failed to fetch workflow nodes" },
			{ status: 500 }
		);
	}
}