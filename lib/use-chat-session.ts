"use client";

import { useChat } from "@chat-adapter/web/react";
import { useMachine } from "@xstate/react";
import { chatMachine } from "./chat-machine";
import { applyHookStatus, eventForChatStatus } from "./chat-status";

export function useChatSession(threadId: string) {
  const [snapshot, send] = useMachine(chatMachine, {
    input: { threadId },
  });

  const { messages, sendMessage, status, stop, error, regenerate } = useChat({
    api: "/api/chat",
    threadId,
    onFinish: () => {
      send({ type: "DONE" });
    },
    onError: (err) => {
      send({
        type: "FAIL",
        error: err instanceof Error ? err.message : "Request failed",
      });
    },
  });

  const machineState = String(snapshot.value);
  if (eventForChatStatus(status, machineState)) {
    queueMicrotask(() => {
      applyHookStatus(send, machineState, status);
    });
  }

  const sendText = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    if (snapshot.matches("sending") || snapshot.matches("streaming")) return;
    send({ type: "SUBMIT" });
    sendMessage({ text: trimmed });
  };

  const stopGeneration = () => {
    send({ type: "STOP" });
    stop();
  };

  const retry = () => {
    send({ type: "RETRY" });
    regenerate();
  };

  return {
    messages,
    status,
    snapshot,
    error,
    sendText,
    stopGeneration,
    retry,
  };
}
