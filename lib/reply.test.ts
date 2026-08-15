import assert from "node:assert/strict";
import { test } from "node:test";
import { replyToDirectMessage, shouldUseXai } from "./reply";

test("shouldUseXai follows the shipped XAI_API_KEY branch", () => {
  assert.equal(shouldUseXai({}), false);
  assert.equal(shouldUseXai({ XAI_API_KEY: "" }), false);
  assert.equal(shouldUseXai({ XAI_API_KEY: "sk-test" }), true);
});

test("replyToDirectMessage posts the echo stream when no key is set", async () => {
  const posted: string[] = [];
  const thread = {
    allMessages: {
      async *[Symbol.asyncIterator]() {},
    },
    async post(content: AsyncIterable<string>) {
      for await (const chunk of content) {
        posted.push(chunk);
      }
    },
  };

  const mode = await replyToDirectMessage(
    thread as never,
    { text: "ping" } as never,
    {}
  );

  assert.equal(mode, "echo");
  assert.equal(posted.join(""), "You said: ping");
});
