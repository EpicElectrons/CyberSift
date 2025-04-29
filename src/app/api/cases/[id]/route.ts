import { NextResponse } from "next/server";
import { db } from "@/db";
import { cases, evidence, artifacts, NewCase } from "@/db/schema";
import { eq, inArray, sql } from "drizzle-orm";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid case ID" },
        { status: 400 }
      );
    }
    
    // Get case details
    const caseData = await db.select()
      .from(cases)
      .where(sql`${cases.id} = ${id}`)
      .limit(1) as any[];
    
    if (!caseData || caseData.length === 0) {
      return NextResponse.json(
        { error: "Case not found" },
        { status: 404 }
      );
    }
    
    // Get related evidence
    const evidenceQuery = await db.select()
      .from(evidence)
      .where(sql`${evidence.caseId} = ${id}`);
    const evidenceData = (evidenceQuery as unknown) as any[];
    
    // Get artifacts for each evidence item
    const evidenceIds = evidenceData.map(e => e.id);
    const artifactsData = evidenceIds.length > 0 
      ? ((await db.select()
          .from(artifacts)
          .where(sql`${artifacts.evidenceId} IN (${evidenceIds.join(',')})`)) as unknown) as any[]
      : [];
    
    return NextResponse.json({
      ...caseData[0],
      evidence: evidenceData,
      artifacts: artifactsData
    });
  } catch (error) {
    console.error("Error fetching case:", error);
    return NextResponse.json(
      { error: "Failed to fetch case" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid case ID" },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    const { title, description, status, threatScore } = body;
    
    const updateData: Partial<NewCase> = {};
    
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (threatScore !== undefined) updateData.threatScore = threatScore;
    updateData.updatedAt = new Date();
    
    const updatedCase = await db.update(cases)
      .set(updateData)
      .where(sql`${cases.id} = ${id}`)
      .returning();
    
    if (!updatedCase.length) {
      return NextResponse.json(
        { error: "Case not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(updatedCase[0]);
  } catch (error) {
    console.error("Error updating case:", error);
    return NextResponse.json(
      { error: "Failed to update case" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid case ID" },
        { status: 400 }
      );
    }
    
    const deletedCase = await db.delete(cases)
      .where(sql`${cases.id} = ${id}`)
      .returning();
    
    if (!deletedCase.length) {
      return NextResponse.json(
        { error: "Case not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting case:", error);
    return NextResponse.json(
      { error: "Failed to delete case" },
      { status: 500 }
    );
  }
}
