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

    if (!session || session.user.role !== "COMPANY") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const company = await prisma.company.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    if (!company) {
      return new NextResponse("Company not found", { status: 404 });
    }

    const job = await prisma.job.findFirst({
      where: {
        id: params.jobId,
        companyId: company.id,
      },
      include: {
        applications: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!job) {
      return new NextResponse("Job not found", { status: 404 });
    }

    return NextResponse.json(job);
  } catch (error) {
    console.log("[COMPANY_JOB_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { jobId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "COMPANY") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const company = await prisma.company.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    if (!company) {
      return new NextResponse("Company not found", { status: 404 });
    }

    const body = await request.json();
    const { title, description, location, type, salary } = body;

    const job = await prisma.job.findFirst({
      where: {
        id: params.jobId,
        companyId: company.id,
      },
    });

    if (!job) {
      return new NextResponse("Job not found", { status: 404 });
    }

    const updatedJob = await prisma.job.update({
      where: {
        id: params.jobId,
      },
      data: {
        title,
        description,
        location,
        type,
        salary,
      },
    });

    return NextResponse.json(updatedJob);
  } catch (error) {
    console.log("[COMPANY_JOB_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { jobId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "COMPANY") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const company = await prisma.company.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    if (!company) {
      return new NextResponse("Company not found", { status: 404 });
    }

    const job = await prisma.job.findFirst({
      where: {
        id: params.jobId,
        companyId: company.id,
      },
    });

    if (!job) {
      return new NextResponse("Job not found", { status: 404 });
    }

    await prisma.job.delete({
      where: {
        id: params.jobId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.log("[COMPANY_JOB_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 