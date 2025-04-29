import { NextResponse } from "next/server";
import { db } from "@/db";
import { threatIntel, NewThreatIntel } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const caseId = searchParams.get('caseId');
    const indicator = searchParams.get('indicator');
    
    let query = db.select().from(threatIntel);
    
    if (caseId) {
      query = query.where(sql`${threatIntel.caseId} = ${parseInt(caseId)}`) as any;
    }
    
    if (indicator) {
      query = query.where(sql`${threatIntel.indicator} = ${indicator}`) as any;
    }
    
    const threats = await query.orderBy(sql`${threatIntel.createdAt} DESC`);
    
    return NextResponse.json(threats);
  } catch (error) {
    console.error("Error fetching threat intel:", error);
    return NextResponse.json(
      { error: "Failed to fetch threat intelligence" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { indicator, caseId } = body;
    
    if (!indicator) {
      return NextResponse.json(
        { error: "Indicator is required" },
        { status: 400 }
      );
    }
    
    // Normally, this would query external threat intelligence APIs
    // For demo, we'll simulate responses

    // Simulate a small delay for API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const threatData: NewThreatIntel = {
      source: Math.random() > 0.5 ? "ThreatFox" : "AlienVault OTX",
      indicator,
      indicatorType: "IP Address",
      severity: Math.floor(Math.random() * 5) + 5, // 5-10
      description: "Associated with known malicious activities",
      caseId: caseId ? parseInt(caseId) : null,
      createdAt: new Date(),
    };
    
    const newThreat = await db.insert(threatIntel)
      .values(threatData)
      .returning();
    
    return NextResponse.json(newThreat[0]);
  } catch (error) {
    console.error("Error creating threat intel:", error);
    return NextResponse.json(
      { error: "Failed to query threat intelligence" },
      { status: 500 }
    );
  }
}
