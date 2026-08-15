import type { UIMessage } from "ai";

export type KitMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export function toKitMessage(message: UIMessage): KitMessage {
  const content = message.parts
    .filter(
      (part): part is { type: "text"; text: string } => part.type === "text"
    )
    .map((part) => part.text)
    .join("");

  return {
    id: message.id,
    role: message.role === "user" ? "user" : "assistant",
    content,
  };
}
