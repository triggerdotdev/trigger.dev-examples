import {
  customEvent,
  scheduleEvent,
  sendEvent,
  Trigger,
} from "@trigger.dev/sdk";
import { z } from "zod";

new Trigger({
  id: "important-workflow",
  name: "A very important workflow, with custom event",
  apiKey: "trigger_development_mLpn9DEEqCRR",
  on: customEvent({
    name: "important.event",
    schema: z.object({
      message: z.string(),
    }),
  }),
  async run(event, context) {
    await sendEvent("start-other-workflow", {
      name: "sendevent.test",
      payload: {
        message: "You can easily trigger workflows from other workflows",
      },
    });
    return {};
  },
});

new Trigger({
  id: "send-an-event",
  name: "Send an event to start a different workflow",
  apiKey: "trigger_development_mLpn9DEEqCRR",
  on: scheduleEvent({}),
  async run(event, context) {
    await sendEvent("start-other-workflow", {
      name: "important.event",
      payload: {
        message: "You can easily trigger workflows from other workflows",
      },
    });
    return {};
  },
});
