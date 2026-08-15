export async function* echoTextStream(text: string): AsyncGenerator<string> {
  const body = `You said: ${text}`;
  const tokens = body.match(/(\s+|\S+)/g) ?? [body];
  for (const token of tokens) {
    yield token;
    await new Promise((resolve) => setTimeout(resolve, 16));
  }
}
