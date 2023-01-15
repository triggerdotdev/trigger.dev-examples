import { Trigger, customEvent } from "@trigger.dev/sdk";
import { slack } from "@trigger.dev/integrations";
import { z } from "zod";

export const postMessage = new Trigger({
  id: "slack-post-messages",
  name: "Post to slack",
  logLevel: "debug",
  on: customEvent({
    name: "slack-message",
    schema: z.object({
      message: z.string(),
    }),
  }),
  run: async (event, ctx) => {
    await ctx.logger.info("This log will appear on the Trigger.dev run page");

    //send a message to the #test-integrations Slack channel
    //it uses the message text that was passed in the event
    const response = await slack.postMessage("send-to-slack", {
      channel: "test-integrations",
      text: event.message,
    });

    return response.message;
  },
});
