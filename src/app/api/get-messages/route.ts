import { db } from "@/lib/db";
import { messages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const runtime = "edge";

export const POST = async (req: Request) => {
  console.log('messages', messages)
  const { chatId } = await req.json();
  console.log('chatId', chatId)

  const _messages = await db
    .select()
    .from(messages)
    .where(eq(messages.chatId, chatId));
  
  console.log('_messages',_messages)
  return NextResponse.json(_messages);
};