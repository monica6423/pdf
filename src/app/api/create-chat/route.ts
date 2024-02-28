import { loadS3IntoPinecone } from "@/lib/pinecone";
import { NextResponse } from "next/server";

// api endpoint: /api/create-chat
export async function POST(req: Request, res: Response){
  console.log('start calling /api/create-chat')
  try {
    const body = await req.json();
    const { file_key} = body;
    console.log('start loadS3IntoPinecone')
    const pages = await loadS3IntoPinecone(file_key);
    return NextResponse.json({ pages })
  } catch (error) {
    return NextResponse.json({error: "Internal Server Error"}, {status: 500})
  }
}