import assert from "node:assert/strict";
import { test } from "node:test";
import { createActor } from "xstate";
import { chatMachine } from "./chat-machine";

function start() {
  const actor = createActor(chatMachine, { input: { threadId: "home" } });
  actor.start();
  return actor;
}

test("chatMachine starts idle and walks the required session states", () => {
  const actor = start();
  assert.equal(actor.getSnapshot().value, "idle");
  assert.equal(actor.getSnapshot().context.threadId, "home");
  assert.equal(actor.getSnapshot().context.abortable, false);

  actor.send({ type: "SUBMIT" });
  assert.equal(actor.getSnapshot().value, "sending");
  assert.equal(actor.getSnapshot().context.abortable, true);

  actor.send({ type: "TOKEN" });
  assert.equal(actor.getSnapshot().value, "streaming");

  actor.send({ type: "DONE" });
  assert.equal(actor.getSnapshot().value, "idle");
  assert.equal(actor.getSnapshot().context.abortable, false);

  actor.send({ type: "SUBMIT" });
  actor.send({ type: "STOP" });
  assert.equal(actor.getSnapshot().value, "stopped");

  actor.send({ type: "RETRY" });
  actor.send({ type: "FAIL", error: "boom" });
  assert.equal(actor.getSnapshot().value, "error");
  assert.equal(actor.getSnapshot().context.lastError, "boom");
});
