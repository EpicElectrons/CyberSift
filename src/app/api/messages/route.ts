import { NextResponse } from "next/server";
import { db } from "@/db";
import { messages, NewMessage } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const caseId = searchParams.get('caseId');
    
    let query = db.select().from(messages);
    
    if (caseId) {
      const caseIdNum = parseInt(caseId);
      if (!isNaN(caseIdNum)) {
        query = query.where(sql`${messages.caseId} = ${caseIdNum}`) as any;
      }
    }
    
    const messagesData = await query.orderBy(sql`${messages.timestamp} DESC`);
    
    return NextResponse.json(messagesData);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { caseId, role, content, model, userId } = body;
    
    if (!role || !content) {
      return NextResponse.json(
        { error: "Role and content are required" },
        { status: 400 }
      );
    }
    
    const messageData: NewMessage = {
      caseId,
      role,
      content,
      model,
      userId,
      timestamp: new Date(),
    };
    
    const newMessage = await db.insert(messages)
      .values(messageData)
      .returning();
    
    return NextResponse.json(newMessage[0]);
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json(
      { error: "Failed to create message" },
      { status: 500 }
    );
  }
}
