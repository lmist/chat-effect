import type { ChatStatus } from "ai";
import type { ChatEvent } from "./chat-machine";

/**
 * Map the Web adapter hook status onto a machine event.
 *
 * `useChat` `onData` only fires for data-* parts, not text-delta chunks,
 * so a normal echo/xAI stream never calls it. `status === "streaming"` is
 * what the hook sets when text tokens start arriving.
 */
export function eventForChatStatus(
  status: ChatStatus,
  machineState: string
): ChatEvent | null {
  if (status === "streaming" && machineState === "sending") {
    return { type: "TOKEN" };
  }
  return null;
}

export function applyHookStatus(
  send: (event: ChatEvent) => void,
  machineState: string,
  status: ChatStatus
): ChatEvent | null {
  const event = eventForChatStatus(status, machineState);
  if (event) {
    send(event);
  }
  return event;
}
