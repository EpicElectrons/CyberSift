import { NextResponse } from "next/server";
import { db } from "@/db";
import { artifacts, NewArtifact } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const evidenceId = searchParams.get('evidenceId');
    
    let query = db.select().from(artifacts);
    
    if (evidenceId) {
      const evidenceIdNum = parseInt(evidenceId);
      if (!isNaN(evidenceIdNum)) {
        query = query.where(sql`${artifacts.evidenceId} = ${evidenceIdNum}`) as any;
      }
    }
    
    const artifactsData = await query.orderBy(sql`${artifacts.createdAt} DESC`);
    
    return NextResponse.json(artifactsData);
  } catch (error) {
    console.error("Error fetching artifacts:", error);
    return NextResponse.json(
      { error: "Failed to fetch artifacts" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      evidenceId, name, type, path, timestamp,
      threatScore, isMalicious, description, metadata 
    } = body;
    
    if (!evidenceId || !name || !type) {
      return NextResponse.json(
        { error: "Evidence ID, name, and type are required" },
        { status: 400 }
      );
    }
    
    const artifactData: NewArtifact = {
      evidenceId,
      name,
      type,
      path,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      threatScore,
      isMalicious,
      description,
      metadata,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const newArtifact = await db.insert(artifacts)
      .values(artifactData)
      .returning();
    
    return NextResponse.json(newArtifact[0]);
  } catch (error) {
    console.error("Error creating artifact:", error);
    return NextResponse.json(
      { error: "Failed to create artifact" },
      { status: 500 }
    );
  }
}
