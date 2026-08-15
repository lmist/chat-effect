import { after } from "next/server";
import { bot } from "@/lib/bot";

export const maxDuration = 60;

export async function POST(request: Request): Promise<Response> {
  return bot.webhooks.web(request, {
    waitUntil: (task) => after(() => task),
  });
}
