import { github, slack } from "@trigger.dev/integrations";
import { Trigger } from "@trigger.dev/sdk";

new Trigger({
  id: "new-github-star-to-slack",
  name: "New GitHub Star: triggerdotdev/trigger.dev",
  apiKey: "trigger_development_5a4Z40beAsVD",
  logLevel: "debug",
  on: github.events.newStarEvent({
    repo: "triggerdotdev/trigger.dev",
  }),

  run: async (event) => {
    await slack.postMessage("github-stars", {
      channelName: "github-stars",
      text: `New GitHub star from \n<${event.sender.html_url}|${event.sender.login}>`,
    });
  },
}).listen();
