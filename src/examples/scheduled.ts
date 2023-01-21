import { slack } from "@trigger.dev/integrations";
import { scheduleEvent, Trigger } from "@trigger.dev/sdk";

new Trigger({
  id: "new-user",
  name: "New user slack message",
  apiKey: "trigger_development_QOvDmN0TNgfK",
  logLevel: "info",
  on: scheduleEvent({
    rateOf: {
      minutes: 1,
    },
  }),
  run: async (event, ctx) => {
    await ctx.logger.info("This log will appear on the Trigger.dev run page");

    const response = await slack.postMessage("send-to-slack", {
      channelName: "test-integrations",
      text: `This message will keep getting posted every 1 minute`,
    });

    return response.message;
  },
}).listen();
