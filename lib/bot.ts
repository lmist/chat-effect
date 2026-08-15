import { createMemoryState } from "@chat-adapter/state-memory";
import { createWebAdapter } from "@chat-adapter/web";
import { Chat } from "chat";
import { replyToDirectMessage } from "./reply";

const BOT_NAME = "assistant";

export const bot = new Chat({
  userName: BOT_NAME,
  adapters: {
    web: createWebAdapter({
      userName: BOT_NAME,
      getUser: () => ({ id: "web-user", name: "You" }),
    }),
  },
  state: createMemoryState(),
});

bot.onDirectMessage(async (thread, message) => {
  await replyToDirectMessage(thread, message);
});
