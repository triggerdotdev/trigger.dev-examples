import * as slack from "@trigger.dev/slack";
import * as github from "@trigger.dev/github";
import { Trigger } from "@trigger.dev/sdk";
import dotenv from "dotenv";
dotenv.config();

new Trigger({
  id: "new-github-star-to-slack",
  name: "New GitHub Star: triggerdotdev/trigger.dev",
  logLevel: "debug",
  on: github.events.newStarEvent({
    repo: "triggerdotdev/trigger.dev",
  }),
  endpoint: process.env.TRIGGER_ENDPOINT_URL,
  run: async (event) => {
    await slack.postMessage("github-stars", {
      channelName: "github-stars",
      text: `New GitHub star from \n<${event.sender.html_url}|${event.sender.login}>`,
    });
  },
}).listen();
