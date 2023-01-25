import {
  customEvent,
  scheduleEvent,
  sendEvent,
  Trigger,
} from "@trigger.dev/sdk";
import { z } from "zod";

new Trigger({
  id: "important-workflow",
  name: "A very important workflow, that sends a custom event",
  apiKey: "trigger_development_mLpn9DEEqCRR",
  on: customEvent({
    name: "important.event",
    schema: z.object({
      message: z.string(),
    }),
  }),
  async run(event, context) {
    await sendEvent("start-other-workflow", {
      name: "sent.from.workflow",
      payload: {
        message:
          "You can easily trigger workflows from other workflows, like this",
      },
    });
    return;
  },
});

new Trigger({
  id: "receive-from-other-workflow",
  name: "Receive an event from a different workflow",
  apiKey: "trigger_development_mLpn9DEEqCRR",
  on: customEvent({
    name: "sent.from.workflow",
    schema: z.object({
      message: z.string(),
    }),
  }),
  async run(event, context) {
    return;
  },
});

sendEvent("fire.important.event", {
  name: "important.event",
  payload: { message: "This was triggered from a custom event in code" },
});
