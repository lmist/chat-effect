"use client"

import { useChat, type UseChatOptions } from "@ai-sdk/react"

import { cn } from "@/lib/utils"
import { transcribeAudio } from "@/lib/utils/audio"
import { Chat } from "@/registry/default/ui/chat"

// Suggestions shown when the chat is empty
const DEFAULT_SUGGESTIONS = [
  "What is the weather in San Francisco?",
  "Explain step-by-step how to solve this math problem: If x² + 6x + 9 = 25, what is x?",
  "Design a simple algorithm to find the longest palindrome in a string.",
]

type DemoChatProps = {
  /**
   * ID of the model that should be used for this chat session.
   */
  model: string
  /**
   * Optional initial messages displayed in the chat (e.g. demo conversation).
   */
  initialMessages?: UseChatOptions["initialMessages"]
  /**
   * Additional utility class names for the outer container.
   */
  className?: string
}

/**
 * DemoChat isolates the chat logic from any surrounding UI (model selector, etc.).
 * It keeps the same behavior/features as the original ChatDemo component while
 * giving the parent full control over where the model picker lives.
 */
export function DemoChat({ model, initialMessages, className }: DemoChatProps) {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    append,
    stop,
    status,
    setMessages,
  } = useChat({
    initialMessages,
    api: "/api/chat",
    body: { model },
  })

  const isLoading = status === "submitted" || status === "streaming"

  return (
    <div className={cn("flex", "flex-col", "w-full", className)}>
      <Chat
        className="grow"
        messages={messages}
        handleSubmit={handleSubmit}
        input={input}
        handleInputChange={handleInputChange}
        isGenerating={isLoading}
        stop={stop}
        append={append}
        setMessages={setMessages}
        transcribeAudio={transcribeAudio}
        suggestions={DEFAULT_SUGGESTIONS}
      />
    </div>
  )
}
