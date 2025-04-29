import { NextResponse } from "next/server";
import { db } from "@/db";
import { evidence, NewEvidence } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { supabase } from "@/db/supabase";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const caseId = searchParams.get('caseId');
    
    let query = db.select().from(evidence);
    
    if (caseId) {
      const caseIdNum = parseInt(caseId);
      if (!isNaN(caseIdNum)) {
        query = query.where(sql`${evidence.caseId} = ${caseIdNum}`) as any;
      }
    }
    
    const evidenceData = await query.orderBy(sql`${evidence.createdAt} DESC`);
    
    return NextResponse.json(evidenceData);
  } catch (error) {
    console.error("Error fetching evidence:", error);
    return NextResponse.json(
      { error: "Failed to fetch evidence" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      caseId, name, type, size, status, 
      threatScore, hash, uploadedById 
    } = body;
    
    if (!caseId || !name || !type) {
      return NextResponse.json(
        { error: "Case ID, name, and type are required" },
        { status: 400 }
      );
    }
    
    // Generate a unique storage path for the evidence
    const storagePath = `evidence/${caseId}/${Date.now()}-${name.replace(/\s+/g, '_')}`;
    
    const evidenceData: NewEvidence = {
      caseId,
      name,
      type,
      size,
      status: status || 'processing',
      threatScore,
      hash,
      storagePath,
      uploadedById,
      timestamp: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const newEvidence = await db.insert(evidence)
      .values(evidenceData)
      .returning();
    
    return NextResponse.json(newEvidence[0]);
  } catch (error) {
    console.error("Error creating evidence:", error);
    return NextResponse.json(
      { error: "Failed to create evidence" },
      { status: 500 }
    );
  }
}
