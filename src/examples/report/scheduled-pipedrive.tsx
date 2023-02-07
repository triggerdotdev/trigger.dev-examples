import * as resend from "@trigger.dev/resend";
import { fetch, scheduleEvent, Trigger } from "@trigger.dev/sdk";
import dotenv from "dotenv";
import { z } from "zod";
import { ReportEmail } from "./email-template";
dotenv.config();

new Trigger({
  id: "scheduled-pipedrive-email",
  name: "Scheduled Pipedrive deals email",
  logLevel: "info",
  on: scheduleEvent({
    rateOf: {
      days: 1,
    },
  }),
  endpoint: process.env.TRIGGER_ENDPOINT_URL,
  run: async (event, ctx) => {
    const allDeals = await getPipedriveLeads();
    const activeDeals = allDeals.body?.data.filter((d) => d.active);
    await ctx.logger.info("Active deals", activeDeals);

    const reportResponse = await resend.sendEmail("report-email", {
      from: "Trigger.dev <matt@email.trigger.dev>",
      replyTo: "James <matt@trigger.dev>",
      to: "matt@trigger.dev",
      subject: `Pipedrive report: ${activeDeals?.length ?? 0} active deals`,
      react: (
        <ReportEmail
          pipeDriveDeals={activeDeals}
          stages={allDeals.body?.related_objects.stage}
        />
      ),
    });

    return;
  },
}).listen();

const pipedriveDealsSchema = z.object({
  data: z.array(
    z.object({
      id: z.number(),
      active: z.boolean(),
      title: z.string(),
      value: z.number(),
      currency: z.string(),
      add_time: z.string(),
      update_time: z.string(),
      stage_id: z.number(),
      status: z.string(),
      probability: z.number().nullish(),
      next_activity_date: z.string().nullish(),
      next_activity_time: z.string().nullish(),
      next_activity_id: z.number().nullish(),
      last_activity_id: z.number().nullish(),
      last_activity_date: z.string().nullish(),
      lost_reason: z.string().nullish(),
      visible_to: z.string().nullish(),
      close_time: z.string().nullish(),
      pipeline_id: z.number().nullish(),
      won_time: z.string().nullish(),
      first_won_time: z.string().nullish(),
      lost_time: z.string().nullish(),
      products_count: z.number().nullish(),
      files_count: z.number().nullish(),
      notes_count: z.number().nullish(),
      followers_count: z.number().nullish(),
      email_messages_count: z.number().nullish(),
      activities_count: z.number().nullish(),
      done_activities_count: z.number().nullish(),
      undone_activities_count: z.number().nullish(),
      participants_count: z.number().nullish(),
      expected_close_date: z.string().nullish(),
      last_incoming_mail_time: z.string().nullish(),
      last_outgoing_mail_time: z.string().nullish(),
      label: z.string().nullish(),
      stage_order_nr: z.number().nullish(),
      person_name: z.string().nullish(),
      org_name: z.string().nullish(),
      next_activity_subject: z.string().nullish(),
      next_activity_type: z.string().nullish(),
      next_activity_duration: z.string().nullish(),
      next_activity_note: z.string().nullish(),
      formatted_value: z.string().nullish(),
      weighted_value: z.number().nullish(),
      formatted_weighted_value: z.string().nullish(),
      weighted_value_currency: z.string().nullish(),
      rotten_time: z.string().nullish(),
      owner_name: z.string().nullish(),
      cc_email: z.string().nullish(),
      org_hidden: z.boolean().nullish(),
      person_hidden: z.boolean().nullish(),
    })
  ),
  related_objects: z.object({
    stage: z.record(
      z.object({
        id: z.number(),
        name: z.string(),
      })
    ),
  }),
});

export type PipedriveDeal = z.infer<
  typeof pipedriveDealsSchema
>["data"][number];

export type PipedriveStages = z.infer<
  typeof pipedriveDealsSchema
>["related_objects"]["stage"];

async function getPipedriveLeads() {
  return fetch(
    "get-deals",
    `https://api.pipedrive.com/v1/deals?api_token=${process.env.PIPEDRIVE_API_KEY}`,
    {
      method: "GET",
      responseSchema: pipedriveDealsSchema,
    }
  );
}
