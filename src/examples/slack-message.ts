import { Trigger, customEvent } from "@trigger.dev/sdk";
import { slack } from "@trigger.dev/integrations";
import { z } from "zod";

const postMessage = new Trigger({
  id: "new-user",
  name: "New user slack message",
  apiKey: "trigger_development_hOOzMfDV2G04",
  logLevel: "info",
  on: customEvent({
    name: "user.created",
    schema: z.object({
      name: z.string(),
      email: z.string(),
      paidPlan: z.boolean(),
    }),
  }),
  run: async (event, ctx) => {
    await ctx.logger.info("This log will appear on the Trigger.dev run page");

    //send a message to the #new-users Slack channel with user details
    const response = await slack.postMessage("send-to-slack", {
      channel: "test-integrations",
      text: `New user: ${event.name} (${event.email}) signed up. ${
        event.paidPlan ? "They are paying" : "They are on the free plan"
      }.`,
    });

    return response.message;
  },
});

//this workflow will now connect and start listening for events
postMessage.listen();
