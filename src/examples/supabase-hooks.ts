import * as slack from "@trigger.dev/slack";
import { Trigger, webhookEvent } from "@trigger.dev/sdk";

import { z } from "zod";
import dotenv from "dotenv";
dotenv.config();

const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
  authInfo: z.object({
    foo: z.string(),
  }),
  created_at: z.coerce.date(),
  numberOfThings: z.number().optional(),
});

const SupabaseUpdateSchema = z.object({
  type: z.literal("UPDATE"),
  table: z.string(),
  record: UserSchema,
  old_record: UserSchema,
  schema: z.string(),
});

const SupabaseInsertSchema = z.object({
  type: z.literal("INSERT"),
  table: z.string(),
  record: UserSchema,
  old_record: z.null(),
  schema: z.string(),
});

const SupabaseDeleteSchema = z.object({
  type: z.literal("DELETE"),
  table: z.string(),
  record: z.null(),
  old_record: UserSchema,
  schema: z.string(),
});

const SupabaseEventSchema = z.discriminatedUnion("type", [
  SupabaseUpdateSchema,
  SupabaseInsertSchema,
  SupabaseDeleteSchema,
]);

// After you first create this trigger, you'll need to go to visit app.trigger.dev and add the webhook URL to your Supabase project
new Trigger({
  id: "on-supabase-user",
  name: "On Supabase User",
  endpoint: process.env.TRIGGER_ENDPOINT_URL,
  on: webhookEvent({
    service: "supabase", // this is arbitrary, you can set it to whatever you want
    eventName: "user.change", // this is arbitrary, you can set it to whatever you want
    filter: {
      type: ["INSERT", "UPDATE", "DELETE"], // You can filter on the type of event
      table: ["users"], // You can filter on the table
    },
    schema: SupabaseEventSchema, // the event will be validated against this schema and typed as `z.infer<typeof SupabaseEventSchema>`
  }),
  run: async (event, ctx) => {
    await ctx.logger.info("Received a supabase webhook", {
      event,
      wallTime: new Date(),
    });

    switch (event.type) {
      case "INSERT":
        await slack.postMessage(`Supabase user created`, {
          channelName: "customers",
          text: `New User: ${event.record.email}`,
        });
        break;
      case "UPDATE":
        await slack.postMessage(`Supabase user updated`, {
          channelName: "customers",
          text: `Updated User: ${event.record.email}`,
        });
        break;
      case "DELETE":
        await slack.postMessage(`Supabase user deleted`, {
          channelName: "customers",
          text: `Deleted User: ${event.old_record.email}`,
        });
        break;
    }
  },
}).listen();
