"use client";
import React, { useEffect } from "react";
import { Input } from "./ui/input";
import { useChat } from "ai/react";
import { Button } from "./ui/button";
import { Send } from "lucide-react";
import MessageList from "./MessageList";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Message } from "ai";

type Props = { chatId: number };

const ChatComponent = ({ chatId }: Props) => {
  console.log('chatid', chatId)
  const { data } = useQuery({
    queryKey: ["chat", chatId],
    queryFn: async () => {
      const response = await axios.post<Message[]>('/api/get-messages', { chatId });
      return response.data;
    }
  })

  // giving control to gpt?
  // assistent is the AI reply, user is what we sent to the gpt
  const { input, handleInputChange, handleSubmit, messages} = useChat({
    api:"/api/chat",
    body: {
      chatId
    },
    initialMessages: data || []
  });

  useEffect(() => {
    const messageContainer = document.getElementById("message-container");
    if (messageContainer) {
      messageContainer.scrollTo({
        top: messageContainer.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages])

  return (
    <div
      className="relative max-h-screen overflow-scroll"
      id="message-container"
    >
      {/* header */}
      <div className="sticky top-0 inset-x-0 p-2 bg-white h-fit">
        <h3 className="text-xl font-bold">Chat</h3>
      </div>
      {/* message list */}
      <MessageList isLoading={false} messages={messages} />
      <form
        onSubmit={handleSubmit}
        className="sticky bottom-0 inset-x-0 px-2 py-4 bg-white"
      >
        <div className="flex">
          {/* whenever we submit the input, it will send the current messa to /api/chat */}
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Send a message."
            className="w-full"
          />
          <Button className="bg-orange-500 ml-2">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
     
    </div>
  );
};

export default ChatComponent;