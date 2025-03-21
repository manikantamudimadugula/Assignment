import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "SEEKER") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { jobId, coverLetter } = body;

    if (!jobId) {
      return new NextResponse("Job ID is required", { status: 400 });
    }

    // Check if user has already applied
    const existingApplication = await prisma.application.findFirst({
      where: {
        jobId,
        userId: session.user.id,
      },
    });

    if (existingApplication) {
      return new NextResponse("You have already applied for this job", { status: 400 });
    }

    // Create application
    const application = await prisma.application.create({
      data: {
        jobId,
        userId: session.user.id,
        coverLetter,
        status: "PENDING",
      },
    });

    return NextResponse.json(application);
  } catch (error) {
    console.log("[SEEKER_APPLICATION_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "SEEKER") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const applications = await prisma.application.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        job: {
          include: {
            company: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(applications);
  } catch (error) {
    console.log("[SEEKER_APPLICATIONS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 