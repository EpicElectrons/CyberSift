import { NextResponse } from "next/server";
import { db } from "@/db";
import { cases, NewCase } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    let query = db.select().from(cases);
    
    if (status) {
      query = query.where(sql`${cases.status} = ${status}`) as any;
    }
    
    const casesData = await query.orderBy(sql`${cases.createdAt} DESC`);
    
    return NextResponse.json(casesData);
  } catch (error) {
    console.error("Error fetching cases:", error);
    return NextResponse.json(
      { error: "Failed to fetch cases" },
      { status: 500 }
    );
  }
}
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      title, 
      description, 
      status, 
      threatScore, 
      createdById,
      reporterName,
      reporterEmail,
      reporterPhone,
      attackType,
      sourceIp,
      aiConfidence
    } = body;
    
    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }
    
    const caseData: NewCase = {
      title,
      description,
      status: status || 'active',
      threatScore,
      createdById,
      reporterName,
      reporterEmail,
      reporterPhone,
      attackType,
      sourceIp,
      aiConfidence,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const newCase = await db.insert(cases)
      .values(caseData)
      .returning();
    
    return NextResponse.json(newCase[0]);
  } catch (error) {
    console.error("Error creating case:", error);
    return NextResponse.json(
      { error: "Failed to create case" },
      { status: 500 }
    );
  }
}