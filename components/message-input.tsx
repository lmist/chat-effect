"use client";

import { ArrowUp, Square } from "lucide-react";
import type { KeyboardEvent } from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface MessageInputProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  stop?: () => void;
  isGenerating: boolean;
  placeholder?: string;
}

export function MessageInput({
  value,
  onChange,
  stop,
  isGenerating,
  placeholder = "Ask AI...",
}: MessageInputProps) {
  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  };

  return (
    <div className="relative rounded-xl border border-input bg-muted">
      <textarea
        aria-label="Message"
        className={cn(
          "w-full resize-none bg-transparent px-3.5 pt-3.5 pb-12 text-sm outline-none",
          "max-h-48 min-h-14 field-sizing-content disabled:opacity-50"
        )}
        disabled={isGenerating}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        rows={1}
        value={value}
      />
      <div className="absolute right-3 bottom-3">
        {isGenerating ? (
          <Button
            type="button"
            size="icon"
            variant="secondary"
            aria-label="Stop generating"
            onClick={stop}
          >
            <Square className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            type="submit"
            size="icon"
            aria-label="Send message"
            disabled={!value.trim()}
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
