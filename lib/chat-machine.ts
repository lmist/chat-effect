import { assign, setup } from "xstate";

export type ChatEvent =
  | { type: "SUBMIT" }
  | { type: "TOKEN" }
  | { type: "DONE" }
  | { type: "FAIL"; error: string }
  | { type: "STOP" }
  | { type: "RETRY" };

export type ChatMachineContext = {
  threadId: string;
  lastError: string | null;
  abortable: boolean;
};

export const chatMachine = setup({
  types: {
    context: {} as ChatMachineContext,
    events: {} as ChatEvent,
    input: {} as { threadId: string },
  },
}).createMachine({
  id: "chatSession",
  initial: "idle",
  context: ({ input }) => ({
    threadId: input.threadId,
    lastError: null,
    abortable: false,
  }),
  states: {
    idle: {
      on: {
        SUBMIT: {
          target: "sending",
          actions: assign({ abortable: true, lastError: null }),
        },
      },
    },
    sending: {
      on: {
        TOKEN: { target: "streaming" },
        DONE: {
          target: "idle",
          actions: assign({ abortable: false }),
        },
        FAIL: {
          target: "error",
          actions: assign({
            lastError: ({ event }) => event.error,
            abortable: false,
          }),
        },
        STOP: {
          target: "stopped",
          actions: assign({ abortable: false }),
        },
      },
    },
    streaming: {
      on: {
        TOKEN: { target: "streaming" },
        DONE: {
          target: "idle",
          actions: assign({ abortable: false }),
        },
        FAIL: {
          target: "error",
          actions: assign({
            lastError: ({ event }) => event.error,
            abortable: false,
          }),
        },
        STOP: {
          target: "stopped",
          actions: assign({ abortable: false }),
        },
      },
    },
    stopped: {
      on: {
        SUBMIT: {
          target: "sending",
          actions: assign({ abortable: true, lastError: null }),
        },
        RETRY: {
          target: "sending",
          actions: assign({ abortable: true, lastError: null }),
        },
      },
    },
    error: {
      on: {
        RETRY: {
          target: "sending",
          actions: assign({ abortable: true, lastError: null }),
        },
        SUBMIT: {
          target: "sending",
          actions: assign({ abortable: true, lastError: null }),
        },
      },
    },
  },
});
