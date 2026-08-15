import assert from "node:assert/strict";
import { test } from "node:test";
import { createActor } from "xstate";
import { chatMachine } from "./chat-machine";
import { applyHookStatus, eventForChatStatus } from "./chat-status";

test("eventForChatStatus emits TOKEN only when hook is streaming from sending", () => {
  assert.deepEqual(eventForChatStatus("streaming", "sending"), {
    type: "TOKEN",
  });
  assert.equal(eventForChatStatus("submitted", "sending"), null);
  assert.equal(eventForChatStatus("ready", "sending"), null);
  assert.equal(eventForChatStatus("streaming", "streaming"), null);
  assert.equal(eventForChatStatus("streaming", "idle"), null);
});

test("applyHookStatus drives the shipped machine sending → streaming on hook status", () => {
  const actor = createActor(chatMachine, { input: { threadId: "home" } });
  actor.start();
  actor.send({ type: "SUBMIT" });
  assert.equal(actor.getSnapshot().value, "sending");

  const sent = applyHookStatus(
    (event) => actor.send(event),
    String(actor.getSnapshot().value),
    "streaming"
  );

  assert.deepEqual(sent, { type: "TOKEN" });
  assert.equal(actor.getSnapshot().value, "streaming");
});
