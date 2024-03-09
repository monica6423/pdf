import { Configuration, OpenAIApi } from "openai-edge";
import { Message, StreamingTextResponse, OpenAIStream } from "ai";


export const runtime = "edge";

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(config);

export async function POST(req: Request) {
  try {
    const { messages, chatId } = await req.json();

    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages,
      // instead of waiting it to generate the whole response and then send it back at once
      // it will start sending word by word back
      stream: true,
    });
    const stream = OpenAIStream(response);
    return new StreamingTextResponse(stream);
  } catch (error) {}
}