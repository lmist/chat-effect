"use client";

import { useState, type FormEvent } from "react";

import { cn } from "@/lib/utils";
import type { KitMessage } from "@/lib/map-ui-message";
import { CopyButton } from "@/components/copy-button";
import { MessageInput } from "@/components/message-input";
import { MessageList } from "@/components/message-list";
import { PromptSuggestions } from "@/components/prompt-suggestions";
import { Button } from "@/components/ui/button";

type ChatViewProps = {
  messages: KitMessage[];
  isGenerating: boolean;
  isEmpty: boolean;
  isError: boolean;
  errorMessage: string | null;
  onSend: (text: string) => void;
  onStop: () => void;
  onRetry: () => void;
  suggestions: string[];
  className?: string;
};

export function Chat({
  messages,
  isGenerating,
  isEmpty,
  isError,
  errorMessage,
  onSend,
  onStop,
  onRetry,
  suggestions,
  className,
}: ChatViewProps) {
  const [input, setInput] = useState("");
  const lastMessage = messages.at(-1);
  const isTyping = isGenerating && lastMessage?.role === "user";

  const handleSubmit = (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    const text = input.trim();
    if (!text || isGenerating) return;
    onSend(text);
    setInput("");
  };

  return (
    <div
      className={cn(
        "grid max-h-full w-full grid-rows-[1fr_auto]",
        className
      )}
    >
      <div className="min-h-0 overflow-y-auto pb-4">
        {isEmpty ? (
          <PromptSuggestions
            label="Try these prompts"
            onSelect={onSend}
            suggestions={suggestions}
          />
        ) : (
          <MessageList
            messages={messages}
            isTyping={isTyping}
            messageOptions={(message) =>
              message.role === "assistant"
                ? {
                    actions: (
                      <CopyButton
                        content={message.content}
                        copyMessage="Copied response to clipboard!"
                      />
                    ),
                  }
                : {}
            }
          />
        )}
      </div>

      {isError ? (
        <div className="mb-3 flex items-center justify-between gap-3 rounded-lg border border-destructive/40 bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive">
          <p>{errorMessage ?? "Something went wrong."}</p>
          <Button type="button" size="sm" variant="outline" onClick={onRetry}>
            Retry
          </Button>
        </div>
      ) : null}

      <form className="mt-auto" onSubmit={handleSubmit}>
        <MessageInput
          value={input}
          onChange={(event) => setInput(event.target.value)}
          stop={onStop}
          isGenerating={isGenerating}
        />
      </form>
    </div>
  );
}
