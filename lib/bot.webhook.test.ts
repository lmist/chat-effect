import assert from "node:assert/strict";
import { test } from "node:test";
import { bot } from "./bot";

test("bot.webhooks.web streams an echo for a useChat UI message body", async () => {
  delete process.env.XAI_API_KEY;

  const request = new Request("http://localhost/api/chat", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      id: "verify-1",
      messages: [
        {
          id: "m1",
          role: "user",
          parts: [{ type: "text", text: "hello" }],
        },
      ],
    }),
  });

  const response = await bot.webhooks.web(request);
  assert.ok(response.ok, `expected 2xx, got ${response.status}`);

  const body = await response.text();
  const deltas = [...body.matchAll(/"delta":"((?:\\.|[^"\\])*)"/g)].map(
    (match) => JSON.parse(`"${match[1]}"`)
  );
  assert.equal(deltas.join(""), "You said: hello");
});
