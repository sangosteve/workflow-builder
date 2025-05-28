import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	try {
		const data = await request.json();
		console.log("Received edge data:", data);

		// Validate required fields
		if (!data.workflowId) {
			return NextResponse.json(
				{ error: "Workflow ID is required" },
				{ status: 400 }
			);
		}

		if (!data.sourceNodeId) {
			return NextResponse.json(
				{ error: "Source node ID is required" },
				{ status: 400 }
			);
		}

		if (!data.targetNodeId) {
			return NextResponse.json(
				{ error: "Target node ID is required" },
				{ status: 400 }
			);
		}

		// Create the edge
		const edge = await prisma.edge.create({
			data: {
				workflowId: data.workflowId,
				sourceNodeId: data.sourceNodeId,
				targetNodeId: data.targetNodeId,
				label: data.label || "",
				condition: data.condition || "",
			},
		});

		return NextResponse.json(edge);
	} catch (error) {
		console.error("Error creating edge:", error);
		return NextResponse.json(
			{ error: "Failed to create edge" },
			{ status: 500 }
		);
	}
}

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const workflowId = searchParams.get("workflowId");

		if (!workflowId) {
			return NextResponse.json(
				{ error: "Workflow ID is required" },
				{ status: 400 }
			);
		}

		const edges = await prisma.edge.findMany({
			where: {
				workflowId,
			},
		});

		return NextResponse.json(edges);
	} catch (error) {
		console.error("Error fetching edges:", error);
		return NextResponse.json(
			{ error: "Failed to fetch edges" },
			{ status: 500 }
		);
	}
}
