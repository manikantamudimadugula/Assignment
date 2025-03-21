import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    // Debug session
    console.log("Session data:", session);

    if (!session?.user?.id) {
      return new NextResponse(
        JSON.stringify({ error: "Authentication required" }), 
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (session.user.role !== "SEEKER") {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized role" }), 
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    try {
      const profile = await prisma.profile.findUnique({
        where: { userId: session.user.id },
      });

      if (!profile) {
        // Create new profile if none exists
        const newProfile = await prisma.profile.create({
          data: {
            userId: session.user.id,
            skills: [],
          },
        });
        return NextResponse.json(newProfile);
      }

      return NextResponse.json(profile);
    } catch (dbError) {
      console.error("Database error:", dbError);
      if (dbError instanceof Prisma.PrismaClientKnownRequestError) {
        return new NextResponse(
          JSON.stringify({ error: "Database error", code: dbError.code }), 
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }
      throw dbError;
    }
  } catch (error) {
    console.error("Profile GET error:", error);
    return new NextResponse(
      JSON.stringify({ 
        error: "Internal Server Error", 
        details: error instanceof Error ? error.message : "Unknown error" 
      }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse(
        JSON.stringify({ error: "Authentication required" }), 
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (session.user.role !== "SEEKER") {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized role" }), 
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();
    const { bio, skills, experience, education } = body;

    const sanitizedSkills = Array.isArray(skills) ? skills : 
                          typeof skills === 'string' ? skills.split(',').map(s => s.trim()) :
                          [];

    try {
      const profile = await prisma.profile.upsert({
        where: { userId: session.user.id },
        update: {
          bio,
          skills: sanitizedSkills,
          experience,
          education,
        },
        create: {
          userId: session.user.id,
          bio: bio || "",
          skills: sanitizedSkills,
          experience: experience || "",
          education: education || "",
        },
      });

      return NextResponse.json(profile);
    } catch (dbError) {
      console.error("Database error:", dbError);
      if (dbError instanceof Prisma.PrismaClientKnownRequestError) {
        return new NextResponse(
          JSON.stringify({ error: "Database error", code: dbError.code }), 
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }
      throw dbError;
    }
  } catch (error) {
    console.error("Profile PUT error:", error);
    return new NextResponse(
      JSON.stringify({ 
        error: "Internal Server Error", 
        details: error instanceof Error ? error.message : "Unknown error" 
      }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}


