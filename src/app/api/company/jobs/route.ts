import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function GET() {
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

    const jobs = await prisma.job.findMany({
      where: {
        companyId: company.id,
      },
      include: {
        applications: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(jobs);
  } catch (error) {
    console.log("[COMPANY_JOBS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "COMPANY") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { title, description, location, type, salary } = body;

    const company = await prisma.company.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    if (!company) {
      return new NextResponse("Company not found", { status: 404 });
    }

    const job = await prisma.job.create({
      data: {
        title,
        description,
        location,
        type,
        salary,
        companyId: company.id,
      },
    });

    return NextResponse.json(job);
  } catch (error) {
    console.log("[COMPANY_JOBS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 