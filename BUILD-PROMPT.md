# Build a Chat SDK web app

You are an independent Grok session in this repository. Work only in this repo.

## Phase contract

1. **Plan first** (`/plan`). Explore `AGENTS.md`, `.agents/skills/chat-sdk/SKILL.md`, `node_modules/chat/docs/`, `repos/effect` (SDK source), and `repos/shadcn-chatbot-kit`. Write a concrete implementation plan to `PLAN.md` at the repo root. Do not implement during plan. Cover architecture, files you will add, how Chat SDK Web adapter + shadcn-chatbot-kit + XState fit together, verification, and the Vercel deploy path.
2. **Then execute** (`/goal`). When you are told to execute, treat this as the goal:

> Ship a working Next.js web chat at the repository root that uses Chat SDK (`chat`) + `@chat-adapter/web`, a shadcn-chatbot-kit UI, and an XState conversation machine. `npm run build` must pass. Deploy to Vercel production. Write `FEEDBACK.md` with your honest build-experience notes.

Do not stop at a scaffold. The goal is complete only when the app builds, the chat UI runs against `/api/chat`, and a Vercel production URL exists (or `FEEDBACK.md` records the exact deploy blocker).

## Product

A single-page web assistant.

- Full-height chat using shadcn-chatbot-kit components (message list, composer, suggestions, stop, copy).
- Dark, readable theme. Works at desktop and mobile widths.
- Client conversation UX is an **XState v5** machine (`xstate` + `@xstate/react`): `idle`, `sending`, `streaming`, `stopped`, `error`.
- Server bot is Chat SDK with the **Web adapter**. Incoming browser turns hit `onDirectMessage`. Replies stream with `thread.post(textStream)`.
- If `XAI_API_KEY` is set, generate with AI SDK + xAI (or AI Gateway) and `toAiMessages` for history. If it is not set, stream a deterministic echo so the product still demos.
- Optional: one suggested-prompt row and a "new conversation" control that changes `threadId`.

## Hard constraints

- Read `AGENTS.md` and the `chat-sdk` skill before writing bot code.
- `npm install chat` is already done. Add `@chat-adapter/web`, `@chat-adapter/state-memory`, `xstate`, Next.js, Tailwind, shadcn peers, etc. as needed.
- App root is this repo root. `repos/effect` and `repos/shadcn-chatbot-kit` are vendor trees, not deploy roots.
- Adapt the kit to `@chat-adapter/web/react` `useChat` (current AI SDK UI). Do not glue the kit’s old `ai/react` hook on top of Chat SDK.
- No Slack/Discord adapters. No secrets in git.
- Deploy with `vercel --yes --prod` from the repo root (Vercel CLI is authenticated as `lmisto`). Link a new project named after this repo if needed.
- After deploy, write the production URL into `README.md`.

## Verification

- `npm run build` succeeds.
- `/api/chat` accepts a Web-adapter `useChat` POST and streams a reply.
- XState is actually used (not a comment that says "we could use XState").
- UI is assembled from kit-derived components, not a bare textarea.
- Production URL loads.

## Last step (required)

Create `FEEDBACK.md` with:

1. What went well
2. What the Chat SDK / skill / docs got wrong or left ambiguous
3. What the shadcn-chatbot-kit cost you
4. What you would change about this repo's `AGENTS.md` or the prompt
5. Time sinks and dead ends

Be specific. Quote file paths and missing APIs. This feedback is the second deliverable after the deployed app.
