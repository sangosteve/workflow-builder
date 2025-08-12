import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { requireDbUser } from "@/lib/requireDbUser";

export async function POST(request: Request) {
  try {
    const user = await requireDbUser("/sign-in"); // ensures logged-in user
    const body = await request.json();
    const { name, description, createDefaultTrigger } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Workflow name is required" },
        { status: 400 }
      );
    }

    const workflow = await prisma.workflow.create({
      data: {
        name,
        description: description || "",
        status: "DRAFT",
        userId: user.id, // link workflow to this user
      },
    });

    if (createDefaultTrigger) {
      await prisma.node.create({
        data: {
          workflowId: workflow.id,
          type: "TRIGGER",
          label: "Trigger",
          positionX: 100,
          positionY: 50,
          config: {
            create: {
              config: {
                triggerType: "",
                description:
                  "Configure this trigger to start your workflow",
              },
            },
          },
        },
      });

      await prisma.workflow.update({
        where: { id: workflow.id },
        data: { triggersCount: 1 },
      });
    }

    return NextResponse.json(workflow, { status: 201 });
  } catch (error) {
    console.error("Error creating workflow:", error);
    return NextResponse.json(
      { error: "Failed to create workflow", details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const user = await requireDbUser("/sign-in"); // ensures logged-in user

    const workflows = await prisma.workflow.findMany({
      where: { userId: user.id }, // only fetch user’s workflows
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(workflows);
  } catch (error) {
    console.error("Error fetching workflows:", error);
    return NextResponse.json(
      { error: "Failed to fetch workflows", details: (error as Error).message },
      { status: 500 }
    );
  }
}
