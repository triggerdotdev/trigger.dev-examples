import { slack } from "@trigger.dev/integrations";
import { Trigger } from "@trigger.dev/sdk";
import { z } from "zod";

new Trigger({
  id: "caldotcom-to-slack",
  name: "Cal.com To Slack",
  on: webhookEvent({
    service: "cal.com",
    eventName: "BOOKING_CREATED",
    filter: {
      triggerEvent: ["BOOKING_CREATED"],
    },
    schema: z.any(),
    verifyPayload: {
      enabled: true,
      header: "X-Cal-Signature-256",
    },
  }),
  run: async (event, ctx) => {
    //code here
    await slack.postMessage("send-to-slack", {
      channelName: "cal-com-bookings",
      text: `New booking created`,
    });
  },
}).listen();
