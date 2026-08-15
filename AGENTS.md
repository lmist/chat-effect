# AGENTS.md — Chat SDK resolver

This is the project agent file. Read it before writing any chat, adapter, or UI code.

Installed skills (from `npx skills add vercel/chat`):

- `.agents/skills/chat-sdk/SKILL.md` — load this first
- `.grok/skills/chat-sdk/SKILL.md` — same skill, Grok-native path
- `.agents/skills/add-adapter/SKILL.md` — only if adding a catalog adapter (not needed here)

Canonical docs after `npm i chat`:

- `node_modules/chat/docs/`
- `node_modules/chat/resources/`
- `node_modules/chat/resources/templates.json`
- Site: https://chat-sdk.dev/docs
- Agent index: https://chat-sdk.dev/llms.txt
- Full text: https://chat-sdk.dev/llms-full.txt

This repo vendors Chat SDK source at `repos/effect` (git subtree of https://github.com/vercel/chat). Treat that tree as **reference source**, not the Next.js app root. The running app lives at the repository root and consumes the published `chat` package unless you have a documented reason to import from the subtree.

This repo also vendors https://github.com/Blazity/shadcn-chatbot-kit at `repos/shadcn-chatbot-kit`. Copy or adapt its chat UI components into the app. Do not make that subtree the Next.js root.

## What Chat SDK is

`chat` is a multi-platform bot runtime. You write handlers once; adapters deliver Slack / Teams / Discord / **web** / etc. through the same `Thread` / `Message` model.

```ts
import { Chat } from "chat";
import { createWebAdapter } from "@chat-adapter/web";
import { createMemoryState } from "@chat-adapter/state-memory";

export const bot = new Chat({
  userName: "assistant",
  adapters: {
    web: createWebAdapter({
      userName: "assistant",
      getUser: (req) => ({ id: "web-user" }), // real apps resolve auth here
    }),
  },
  state: createMemoryState(),
});

bot.onDirectMessage(async (thread, message) => {
  await thread.post(`You said: ${message.text}`);
});
```

Wire the webhook in Next.js App Router:

```ts
// app/api/chat/route.ts
import { after } from "next/server";
import { bot } from "@/lib/bot";

export async function POST(request: Request): Promise<Response> {
  return bot.webhooks.web(request, {
    waitUntil: (task) => after(() => task),
  });
}
```

On the client, use the Web adapter hook (AI SDK `useChat` protocol), not a hand-rolled fetch:

```ts
import { useChat } from "@chat-adapter/web/react";

const { messages, sendMessage, status, stop } = useChat({
  api: "/api/chat",
  threadId: "home",
});
```

`getUser` is the security boundary for the Web adapter. Returning `null` is HTTP 401. User ids must not contain `:`.

## Handler routing (do not invent your own)

1. `onDirectMessage` — DMs (the Web adapter conversation is a DM)
2. `onSubscribedMessage` — subscribed non-DM threads
3. `onNewMention` — @-mentions on unsubscribed threads
4. `onNewMessage(regex)` — pattern match on unsubscribed threads

Bot-authored messages do not re-enter these handlers.

Streaming: `thread.post(asyncIterable)` pumps tokens onto the Web adapter SSE response. Pair with AI SDK `streamText(...).textStream`.

History: `toAiMessages` from `chat/ai` converts thread messages into AI SDK conversation format.

Thread state: `thread.setState` / `thread.state` for durable per-thread data. UI ephemeral state belongs in XState.

## Packages this app needs

Install as you go. Expected set:

| Package | Why |
| --- | --- |
| `chat` | Already installed. Core SDK. |
| `@chat-adapter/web` | Browser chat via AI SDK `useChat` protocol. |
| `@chat-adapter/state-memory` | Fine for a single-region demo. Use Redis/Postgres if you add a second instance. |
| `ai` + `@ai-sdk/react` | Streaming / `useChat` protocol. |
| `xstate` + `@xstate/react` | Conversation machine (idle / sending / streaming / error / stopped). |
| Next.js, React, Tailwind, shadcn/ui | App + UI kit peers. |

Do **not** use Slack/Teams adapters unless you also ship their webhooks. This product is a web chat.

## UI: shadcn-chatbot-kit

Source of components: `repos/shadcn-chatbot-kit`.

That kit’s demo talks to the older `ai/react` `useChat` shape (`input`, `handleInputChange`, `handleSubmit`). The Chat SDK Web adapter uses the current AI SDK UI API (`messages` with `parts`, `sendMessage`, `status`). **Adapt the kit components to the Web adapter hook.** Do not force the kit’s old hook over the adapter.

Own the copied components under `components/` (or `src/components/`). Theme with shadcn tokens. Desktop and mobile both have to work.

## State: XState

Use `xstate` (XState v5). There is no npm package named `x-state-machine`.

Model the chat session as a machine, not a pile of booleans:

- context: `threadId`, last error, whether a stream is abortable
- states: `idle` → `sending` → `streaming` → `idle`, plus `error` and `stopped`
- events: `SUBMIT`, `TOKEN`, `DONE`, `FAIL`, `STOP`, `RETRY`

Drive the machine from the Web adapter hook’s `status` / `stop` / `sendMessage`. Keep Chat SDK as the server authority; XState owns client session UX.

## App shape

```
app/
  page.tsx                 # chat shell
  api/chat/route.ts        # bot.webhooks.web
lib/
  bot.ts                   # Chat singleton + handlers
  chat-machine.ts          # XState machine
components/                # kit-derived chat UI
repos/effect/              # vendored vercel/chat (reference only)
repos/shadcn-chatbot-kit/  # vendored UI kit (copy from here)
```

- Next.js App Router at the **repository root**.
- `.env.example` documents `XAI_API_KEY` (optional). If no key is set, stream a deterministic echo so the UI still works.
- If `XAI_API_KEY` is present, reply with AI SDK + xAI (or Vercel AI Gateway). Convert history with `toAiMessages`.
- Never commit secrets. Never treat `repos/*` as the Vercel project root.

## How to resolve Chat SDK questions

1. Read `.agents/skills/chat-sdk/SKILL.md`.
2. Read `node_modules/chat/docs/` for the API you are about to call.
3. For Web adapter specifics, read https://chat-sdk.dev/adapters/official/web.md and `node_modules` types for `@chat-adapter/web`.
4. Only then consult `repos/effect` source (this repo) if the published docs are silent.
5. Prefer `create-chat-sdk` flags over reinventing webhook wiring, then replace its default UI with the kit + XState.

## Out of scope unless asked

- Publishing adapters (`add-adapter` skill)
- Making `repos/effect` the deployed app
- Rewriting the Chat SDK
