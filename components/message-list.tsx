import {
  ChatMessage,
  type ChatMessageProps,
  type Message,
} from "@/components/chat-message";
import { TypingIndicator } from "@/components/typing-indicator";

type AdditionalMessageOptions = Omit<ChatMessageProps, keyof Message>;

interface MessageListProps {
  messages: Message[];
  showTimeStamps?: boolean;
  isTyping?: boolean;
  messageOptions?:
    | AdditionalMessageOptions
    | ((message: Message) => AdditionalMessageOptions);
}

export function MessageList({
  messages,
  showTimeStamps = true,
  isTyping = false,
  messageOptions,
}: MessageListProps) {
  return (
    <div className="space-y-4 overflow-visible">
      {messages.map((message, index) => {
        const additionalOptions =
          typeof messageOptions === "function"
            ? messageOptions(message)
            : messageOptions;

        return (
          <div
            key={message.id}
            ref={
              index === messages.length - 1
                ? (el) => el?.scrollIntoView({ block: "end" })
                : undefined
            }
          >
            <ChatMessage
              showTimeStamp={showTimeStamps}
              {...message}
              {...additionalOptions}
            />
          </div>
        );
      })}
      {isTyping && <TypingIndicator />}
    </div>
  );
}
