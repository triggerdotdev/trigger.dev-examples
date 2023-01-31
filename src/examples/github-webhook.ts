import { Trigger } from "@trigger.dev/sdk";
import * as slack from "@trigger.dev/slack";
import * as github from "@trigger.dev/github";
import dotenv from "dotenv";
dotenv.config();

// Workflow that notifies you of critical GitHub issues
const trigger = new Trigger({
  id: "github-issue-to-slack-message-2",
  name: "Notify of critical issues",
  on: github.events.issueEvent({
    repo: "triggerdotdev/trigger.dev-examples",
  }),
  endpoint: process.env.TRIGGER_ENDPOINT_URL,
  run: async (event, ctx) => {
    if (event.action === "labeled") {
      await ctx.logger.info(
        `The issue ${event.issue.title} was labeled ${event.label?.name}`
      );

      if (event.label?.name === "critical") {
        await slack.postMessage("send-to-slack", {
          channelName: "test-integrations",
          text: `Critical issue: ${event.issue.title} was labeled ${event.label.name}`,
        });
      }
    }

    return event;
  },
});

trigger.listen();
