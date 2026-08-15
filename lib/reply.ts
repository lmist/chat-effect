import { xai } from "@ai-sdk/xai";
import { streamText, type ModelMessage } from "ai";
import type { Message, Thread } from "chat";
import { toAiMessages } from "chat/ai";
import { echoTextStream } from "./echo";

type Env = Record<string, string | undefined>;

export function shouldUseXai(env: Env = process.env): boolean {
  return Boolean(env.XAI_API_KEY);
}

export async function collectAiHistory(
  thread: Thread,
  message: Message,
  limit = 20
): Promise<ModelMessage[]> {
  const collected: Message[] = [];
  for await (const item of thread.allMessages) {
    collected.push(item);
    if (collected.length >= limit) break;
  }

  const history = await toAiMessages(collected);
  if (history.length > 0) {
    return history;
  }

  return [{ role: "user", content: message.text }];
}

export async function replyToDirectMessage(
  thread: Thread,
  message: Message,
  env: Env = process.env
): Promise<"echo" | "xai"> {
  if (!shouldUseXai(env)) {
    await thread.post(echoTextStream(message.text));
    return "echo";
  }

  const messages = await collectAiHistory(thread, message);
  const result = streamText({
    model: xai("grok-4-1-fast-non-reasoning"),
    system: "You are a concise, helpful web assistant.",
    messages,
  });
  await thread.post(result.textStream);
  return "xai";
}
