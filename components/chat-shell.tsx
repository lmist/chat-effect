"use client";

import { useState } from "react";

import { toKitMessage } from "@/lib/map-ui-message";
import { useChatSession } from "@/lib/use-chat-session";
import { Chat } from "@/components/chat";

const SUGGESTIONS = [
  "What can you help me with?",
  "Explain Chat SDK in one paragraph.",
  "Give me a three-item packing list for a weekend trip.",
];

function ChatSession({
  threadId,
  onNewChat,
}: {
  threadId: string;
  onNewChat: () => void;
}) {
  const session = useChatSession(threadId);
  const kitMessages = session.messages.map(toKitMessage);
  const isGenerating =
    session.snapshot.matches("sending") || session.snapshot.matches("streaming");

  return (
    <div className="flex h-dvh flex-col bg-background text-foreground">
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <p className="text-sm font-medium">Assistant</p>
          <p className="text-xs text-muted-foreground">
            {String(session.snapshot.value)}
          </p>
        </div>
        <button
          type="button"
          className="rounded-md border border-border px-3 py-1.5 text-sm"
          onClick={onNewChat}
        >
          New conversation
        </button>
      </header>
      <Chat
        className="mx-auto min-h-0 w-full max-w-3xl flex-1 px-4 py-4"
        messages={kitMessages}
        isGenerating={isGenerating}
        isEmpty={kitMessages.length === 0}
        isError={session.snapshot.matches("error")}
        errorMessage={session.snapshot.context.lastError}
        onSend={session.sendText}
        onStop={session.stopGeneration}
        onRetry={session.retry}
        suggestions={SUGGESTIONS}
      />
    </div>
  );
}

export function ChatShell() {
  const [threadId, setThreadId] = useState("home");
  return (
    <ChatSession
      key={threadId}
      threadId={threadId}
      onNewChat={() => setThreadId(crypto.randomUUID())}
    />
  );
}
