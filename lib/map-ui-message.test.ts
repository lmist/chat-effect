import assert from "node:assert/strict";
import { test } from "node:test";
import type { UIMessage } from "ai";
import { toKitMessage } from "./map-ui-message";

test("toKitMessage joins text parts from a real UIMessage shape", () => {
  const message = {
    id: "m1",
    role: "assistant",
    parts: [
      { type: "text", text: "You said: " },
      { type: "text", text: "hello" },
      { type: "step-start" },
    ],
  } as UIMessage;

  assert.deepEqual(toKitMessage(message), {
    id: "m1",
    role: "assistant",
    content: "You said: hello",
  });
});
