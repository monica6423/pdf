// api endpoint: /chat/{chatId}

import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import ChatSideBar from "@/components/ChatSideBar";
import PDFViewer from "@/components/PDFViewer";

type Props = {
  params: {
    chatId: string
  }
}

export default async function ChatPage({params: {chatId}}: Props) {
  const { userId } = await auth();
  if (!userId) {
    return redirect("/sign-in");
  }

  // a list of chats return from db
  const _chats = await db.select().from(chats).where(eq(chats.userId, userId));

  if (!_chats) {
    return redirect("/");
  }

  if (!_chats.find((chat) => chat.id === parseInt(chatId))) {
    return redirect("/");
  }

  const currentChat = _chats.find(chat => chat.id === parseInt(chatId))

  return (
    <div className="flex max-h-screen overflow-scroll">
      <div className="flex w-full max-h-screen overflow-scroll">
        <div className="flex-[1] max-w-xs">
          <ChatSideBar chats={_chats} chatId={parseInt(chatId)}/>
        </div>
   
        <div className="max-h-screen p-4 oveflow-scroll flex-[5]">
          <PDFViewer pdf_url={currentChat?.pdfUrl || ''}/>
        </div>
        {/* chat component */}
        <div className="flex-[3] border-l-4 border-l-slate-200">

        </div>
      </div>
    </div>
  );
}