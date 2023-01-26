import { customEvent, sendEvent, Trigger } from "@trigger.dev/sdk";
import { z } from "zod";
import dotenv from "dotenv";
dotenv.config();

new Trigger({
  id: "important-workflow",
  name: "A very important workflow, that sends a custom event",
  on: customEvent({
    name: "important.event",
    schema: z.object({
      message: z.string(),
    }),
  }),
  async run(event, context) {
    context.logger.debug(`The message is ${event.message}`);
    await sendEvent("start-other-workflow", {
      name: "sent.from.workflow",
      payload: {
        message:
          "You can easily trigger workflows from other workflows, like this",
      },
    });
    return;
  },
}).listen();

new Trigger({
  id: "receive-from-other-workflow",
  name: "Receive an event from a different workflow",
  on: customEvent({
    name: "sent.from.workflow",
    schema: z.object({
      message: z.string(),
    }),
  }),
  async run(event, context) {
    context.logger.debug(`The message is ${event.message}`);
    return;
  },
}).listen();

async function sendEventAfterTenSeconds() {
  await new Promise((resolve) => setTimeout(resolve, 10000));
  sendEvent("fire.important.event", {
    name: "important.event",
    payload: { message: "This was triggered from a custom event in code" },
  });
}

sendEventAfterTenSeconds();
