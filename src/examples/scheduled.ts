import * as slack from "@trigger.dev/slack";
import { scheduleEvent, Trigger } from "@trigger.dev/sdk";
import dotenv from "dotenv";
dotenv.config();

new Trigger({
  id: "scheduled-test",
  name: "Scheduled slack message",
  logLevel: "info",
  on: scheduleEvent({
    rateOf: {
      minutes: 1,
    },
  }),
  endpoint: process.env.TRIGGER_ENDPOINT_URL,
  run: async (event, ctx) => {
    await ctx.logger.info("This log will appear on the Trigger.dev run page");

    const response = await slack.postMessage("send-to-slack", {
      channelName: "test-integrations",
      text: `This message will keep getting posted every 1 minute`,
    });

    return response.message;
  },
}).listen();
