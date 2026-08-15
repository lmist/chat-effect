# Build feedback

## 1. What went well

The published Web adapter contract is enough to ship a real browser chat without inventing a protocol. `createWebAdapter` + `bot.webhooks.web` + `@chat-adapter/web/react` `useChat` matched the snippets in `AGENTS.md`, `https://chat-sdk.dev/adapters/official/web.md`, and `repos/effect/examples/nextjs-chat/src/app/api/chat/route.ts`.

Streaming is one line on the server: `await thread.post(asyncIterable)`. The echo generator in `lib/echo.ts` and AI SDK `textStream` take the same path. A `useChat`-shaped POST to `/api/chat` (local and production) returned `text/event-stream` with `x-vercel-ai-ui-message-stream: v1` and word-sized `text-delta` chunks.

XState v5 `setup()` / `useMachine` bound cleanly to hook callbacks (`onData` → `TOKEN`, `onFinish` → `DONE`, `onError` → `FAIL`). The header on `/` shows the live snapshot (`idle` after a turn). New conversation remounts via `key={threadId}` without a status `useEffect`.

## 2. What the Chat SDK / skill / docs got wrong or left ambiguous

- **Skill is Slack-first.** `.agents/skills/chat-sdk/SKILL.md` lists Slack/Discord/GitHub guides and templates. It never names `@chat-adapter/web`, `useChat`, or `/api/chat`. The working Web page is `https://chat-sdk.dev/adapters/official/web.md` (and the vendored README at `repos/effect/packages/adapter-web/README.md`).
- **`create-chat-sdk` fights this repo.** The CLI generates a webhook-only app under `src/` (`repos/effect/packages/create-chat-sdk/docs/create-chat-sdk.mdx`). `AGENTS.md` says prefer the CLI, then also requires `app/` + `lib/` at the repository root. Running the CLI here would overwrite the existing root `package.json` and put files in the wrong tree.
- **CLI route omits `waitUntil`.** `generateWebRoute()` emits `export const POST = (request) => bot.webhooks.web(request)`. Official docs and `examples/nextjs-chat` pass `{ waitUntil: (task) => after(() => task) }`. Those two generators disagree.
- **Web history is empty by design.** `WebAdapter.fetchMessages` always resolves `{ messages: [] }`. `persistMessageHistory` backfills from the state adapter. `@chat-adapter/state-memory` warns it is not for production and is lost on every serverless isolate. `toAiMessages(thread.allMessages)` will often see only the current turn on Vercel.
- **`useChat({ id: undefined })` wipes client state.** Documented only in the adapter wrapper (`repos/effect/packages/adapter-web/src/react/index.ts`). Easy to hit if you pass `id: threadId` when `threadId` is unset.
- **`onData` is not a token callback.** `ChatOnDataCallback` in `ai` receives `DataUIPart` only. Text streams never fire it, so wiring `TOKEN` to `onData` leaves the machine in `sending` until `onFinish`. The hook status `"streaming"` is the signal that text-delta started.
- **Package exports are ESM-only.** `@chat-adapter/state-memory` has `"exports": { ".": { "import": ... } }` with no `require`/`default`. Node tests fail unless the app is `"type": "module"`. Next’s bundler hides this.

## 3. What the shadcn-chatbot-kit cost you

The kit at `repos/shadcn-chatbot-kit/apps/www/registry/default/ui/chat.tsx` is built for **AI SDK UI v1**: `input`, `handleInputChange`, `handleSubmit`, `append({ role, content })`, and `Message.content`. `@chat-adapter/web/react` is **current UI**: `UIMessage.parts`, `sendMessage({ text })`, `status`. You cannot drop the kit `Chat` onto the Web hook.

Copying `chat-demo.tsx` would have pulled `@ai-sdk/react@^1` / `ai@^4` against Chat SDK’s `ai@^7` peer. Extra kit weight we threw away: `framer-motion`, `sonner`, `shiki` (async `HighlightedPre` in `markdown-renderer.tsx`), audio recording, file attachments (Web adapter v1 has none), tool-invocation UI.

The useful pieces were visual: bubble variants, suggestion chips, copy control, typing dots, `ChatContainer` `1fr auto` grid. Those had to be re-imported off `@/registry/default/...` onto `@/components`.

## 4. What you would change about this repo’s `AGENTS.md` or the prompt

- Say **do not run `create-chat-sdk` or `create-next-app`** when a root `package.json` already exists. Point at the exact files to add (`app/api/chat/route.ts`, `lib/bot.ts`) instead of “prefer the CLI then replace the UI.”
- Put the Web adapter page and the `waitUntil`/`after` snippet **above** Slack routing. This product is a web chat.
- Document the kit mismatch in `AGENTS.md`: copy `registry/default/ui/*`, rewrite `Chat` props, map `parts` → `content`. One paragraph would have saved a full read of `chat-demo.tsx`.
- Warn that first `vercel --yes --prod` on a repo that only just grew a Next app may **not detect Next.js** (this run created `summerjam/chat-effect` as a static project looking for `public/`). Spell `vercel project update --framework nextjs` next to the deploy command.
- `--name` is deprecated on Vercel CLI 59. “Project name = repo name” still works as the created project id, but the flag prints a warning.
- `BUILD-PROMPT.md` asks for `FEEDBACK.md` *and* a production URL. Keep that. Add “if Vercel does not detect Next, fix the project framework; do not invent a URL.”

## 5. Time sinks and dead ends

- Reading Slack-centric `node_modules/chat/docs/` and skill guides before the Web adapter README. The DM/handler model is right; almost none of the card/mention/subscribe examples apply.
- Deciding whether to run `create-chat-sdk --adapter web memory`. The generator’s `src/` layout and missing UI made it a dead end for this checkout.
- Node tests against `bot.webhooks.web`: first failure was `ERR_PACKAGE_PATH_NOT_EXPORTED` on `@chat-adapter/state-memory` and `chat/ai` under CJS. Second was asserting `/You said: hello/` on an SSE body that splits that string across `"delta":"You"` / `"said:"` / `"hello"` chunks. The stream was correct; the assertion was not.
- First production deploy (`npx vercel --yes --prod --name chat-effect`) **created** `summerjam/chat-effect`, failed to link `lmist/chat-effect` on GitHub, then failed the build with `No Output Directory named "public"`. Fix: `vercel project update chat-effect --framework nextjs` and a second `--prod` deploy. Alias: `https://chat-effect-ashy.vercel.app`.
- Headless Chrome `--screenshot` showed the empty state but could not click. Needed a CDP script against `--remote-debugging-port` to prove a suggestion sends and the assistant echoes.
