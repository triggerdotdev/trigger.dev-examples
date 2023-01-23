import { Trigger } from "@trigger.dev/sdk";
import { github, slack } from "@trigger.dev/integrations";

// Workflow that notifies you of critical GitHub issues
const trigger = new Trigger({
  id: "github-issue-to-slack-message",
  name: "Notify of critical issues",
  apiKey: "trigger_development_xVENvPFYfhdc",
  logLevel: "debug",
  on: github.events.issueEvent({
    repo: "triggerdotdev/trigger.dev",
  }),
  run: async (event, ctx) => {
    if (event.action === "labeled") {
      await ctx.logger.info(
        `The issue ${event.issue.title} was labeled ${event.label?.name}`
      );

      if (event.label?.name === "critical") {
        await slack.postMessage("send-to-slack", {
          channelName: "serious-issues",
          text: `Critical issue: ${event.issue.title} was labeled ${event.label.name}`,
        });
      }
    }

    return event;
  },
});

trigger.listen();

new Trigger({
  id: "github-pr",
  name: "Notify of prs",
  apiKey: "trigger_development_xVENvPFYfhdc",
  logLevel: "debug",
  on: github.events.pullRequestEvent({
    repo: "triggerdotdev/trigger.dev",
  }),
  run: async (event, ctx) => {
    return event;
  },
}).listen();
