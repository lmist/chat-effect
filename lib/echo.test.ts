import assert from "node:assert/strict";
import { test } from "node:test";
import { echoTextStream } from "./echo";

test("echoTextStream yields the shipped You said prefix plus the user text", async () => {
  const chunks: string[] = [];
  for await (const chunk of echoTextStream("hello")) {
    chunks.push(chunk);
  }

  assert.equal(chunks.join(""), "You said: hello");
  assert.ok(chunks.length > 1, "stream must yield more than one token");
});
