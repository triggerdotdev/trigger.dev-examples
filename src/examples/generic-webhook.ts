import * as slack from "@trigger.dev/slack";
import { Trigger, webhookEvent } from "@trigger.dev/sdk";
import { z } from "zod";
import dotenv from "dotenv";
dotenv.config();

const intl = new Intl.DateTimeFormat("en-US", {
  timeStyle: "full",
  dateStyle: "full",
});

// 1. npm run webhook
// 2. To test this workflow go to cal.com
// 3. Go to Settings > Developer > Webhooks https://app.cal.com/settings/developer/webhooks
// 4. Create a new webhook using the details from the Trigger.dev workflow
// 5. Create a new booking and you should see a message in Slack

new Trigger({
  id: "caldotcom-to-slack-2",
  name: "Cal.com To Slack 2",
  on: webhookEvent({
    service: "cal.com",
    eventName: "BOOKING_CREATED",
    filter: {
      triggerEvent: ["BOOKING_CREATED"],
    },
    schema: z
      .object({
        payload: z.object({
          startTime: z.coerce.date(),
          endTime: z.coerce.date(),
          uid: z.string(),
          type: z.string(),
          title: z.string(),
          length: z.number(),
          status: z.string(),
          currency: z.string(),
          location: z.string(),
          metadata: z
            .object({ videoCallUrl: z.string().optional() })
            .optional(),
          attendees: z.array(
            z.object({
              name: z.string(),
              email: z.string(),
              language: z.object({ locale: z.string() }),
              timeZone: z.string(),
            })
          ),
          bookingId: z.number(),
          organizer: z.object({
            id: z.number(),
            name: z.string(),
            email: z.string(),
            language: z.object({ locale: z.string() }),
            timeZone: z.string(),
          }),
          eventTitle: z.string(),
          description: z.string(),
          eventTypeId: z.number(),
        }),
      })
      .passthrough(),
    verifyPayload: {
      enabled: true,
      header: "X-Cal-Signature-256",
    },
  }),
  endpoint: process.env.TRIGGER_ENDPOINT_URL,
  run: async (event, ctx) => {
    //code here
    await slack.postMessage("send-to-slack", {
      channelName: "test-integrations",
      text: `New cal.com booking created\n${intl.format(
        event.payload.startTime
      )} - ${intl.format(event.payload.endTime)}\n${event.payload.attendees
        .map((a) => a.email)
        .join(", ")}\n${event.payload.metadata?.videoCallUrl}`,
    });
  },
}).listen();
