import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "../../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { jobId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "SEEKER") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const job = await prisma.job.findUnique({
      where: {
        id: params.jobId,
      },
      include: {
        company: {
          select: {
            name: true,
            description: true,
            website: true,
          },
        },
      },
    });

    if (!job) {
      return new NextResponse("Job not found", { status: 404 });
    }

    return NextResponse.json(job);
  } catch (error) {
    console.log("[SEEKER_JOB_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 