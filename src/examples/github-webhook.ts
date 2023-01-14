import { Trigger, customEvent } from "@trigger.dev/sdk";
import { github, slack } from "@trigger.dev/integrations";

export function githubWorkflow() {
  // Workflow that notifies you of critical GitHub issues
  const trigger = new Trigger({
    id: "github-issue-to-slack-message",
    name: "Notify of critical issues",
    logLevel: "debug",
    on: github.events.repoIssueEvent({
      repo: "triggerdotdev/trigger.dev"
    }),
    run: async (event, ctx) => {
      if (event.action !== "opened") {
        return;
      }

      if (event.issue.severity !== "critical") {
        await ctx.logger.info(`The issue ${event.issue.} was only ${event.issue.severity}`);
        return;
      }

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

  trigger.listen();
}
