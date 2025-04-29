import { NextResponse } from "next/server";
import { db } from "@/db";
import { evidence, NewEvidence } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid evidence ID" },
        { status: 400 }
      );
    }
    
    const evidenceData = await db.select()
      .from(evidence)
      .where(sql`${evidence.id} = ${id}`)
      .limit(1) as any[];
    
    if (!evidenceData || evidenceData.length === 0) {
      return NextResponse.json(
        { error: "Evidence not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(evidenceData[0]);
  } catch (error) {
    console.error("Error fetching evidence:", error);
    return NextResponse.json(
      { error: "Failed to fetch evidence" },
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
        { error: "Invalid evidence ID" },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    const { name, type, size, status, threatScore, hash } = body;
    
    const updateData: Partial<NewEvidence> = {};
    
    if (name !== undefined) updateData.name = name;
    if (type !== undefined) updateData.type = type;
    if (size !== undefined) updateData.size = size;
    if (status !== undefined) updateData.status = status;
    if (threatScore !== undefined) updateData.threatScore = threatScore;
    if (hash !== undefined) updateData.hash = hash;
    updateData.updatedAt = new Date();
    
    const updatedEvidence = await db.update(evidence)
      .set(updateData)
      .where(sql`${evidence.id} = ${id}`)
      .returning();
    
    if (!updatedEvidence.length) {
      return NextResponse.json(
        { error: "Evidence not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(updatedEvidence[0]);
  } catch (error) {
    console.error("Error updating evidence:", error);
    return NextResponse.json(
      { error: "Failed to update evidence" },
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
        { error: "Invalid evidence ID" },
        { status: 400 }
      );
    }
    
    const deletedEvidence = await db.delete(evidence)
      .where(sql`${evidence.id} = ${id}`)
      .returning();
    
    if (!deletedEvidence.length) {
      return NextResponse.json(
        { error: "Evidence not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting evidence:", error);
    return NextResponse.json(
      { error: "Failed to delete evidence" },
      { status: 500 }
    );
  }
}
