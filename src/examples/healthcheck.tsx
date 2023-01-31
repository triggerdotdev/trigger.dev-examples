/** @jsxImportSource jsx-slack */
import * as slack from "@trigger.dev/slack";
import { fetch, scheduleEvent, Trigger } from "@trigger.dev/sdk";
import dotenv from "dotenv";
import JSXSlack, { Actions, Blocks, Button, Section } from "jsx-slack";
dotenv.config();

const sites = [
  { url: "https://www.google.com", email: "matt@trigger.dev" },
  { url: "https://www.sitedoesntexist.co", email: "matt@trigger.dev" },
  { url: "https://www.facebook.com", email: "matt@trigger.dev" },
  { url: "https://www.amazon.com", email: "matt@trigger.dev" },
];

const BLOCK_ID = "action.buttons";

new Trigger({
  id: "scheduled-healthcheck",
  name: "Scheduled healthcheck",
  logLevel: "info",
  on: scheduleEvent({
    rateOf: {
      minutes: 1,
    },
  }),
  run: async (event, ctx) => {
    const promises = sites.map(async (site) => {
      const up = await isSiteUp(site.url);

      if (!up) {
        await slack.postMessage(`${site}-down-message`, {
          channelName: "test-integrations",
          text: "How is your progress today?",
          blocks: JSXSlack(
            <Blocks>
              <Section>⛔️ {site.url} is down</Section>
              <Actions blockId={BLOCK_ID}>
                <Button actionId="retry" value={site.url}>
                  Retry
                </Button>
                <Button url="https://xkcd.com/1349/">Dashboard</Button>
                <Button url={`mailto:${site.email}`}>Email customer</Button>
              </Actions>
            </Blocks>
          ),
        });
      }
    });

    await Promise.all(promises);
    return {};
  },
}).listen();

//listen for pressed of the retry button
new Trigger({
  id: "healthcheck-retry-interaction",
  name: "Healthcheck retry interaction",
  on: slack.events.blockActionInteraction({
    blockId: BLOCK_ID,
    actionId: ["retry"],
  }),
  run: async (event, ctx) => {
    const firstAction = event.actions[0];
    if (!firstAction) return;
    if (!event.message) return;

    if (firstAction.action_id !== "retry") {
      ctx.logger.error(`Unexpected action: ${event.actions[0]?.action_id}`);
      return;
    }

    if (firstAction.type === "button") {
      const siteUrl = firstAction.value;
      const up = await isSiteUp(siteUrl);
      await slack.postMessageResponse("React to message", event.response_url, {
        text: up ? `✅ ${siteUrl} is now up!` : `😭 ${siteUrl} is still down`,
        replace_original: false,
      });
    }
  },
}).listen();

async function isSiteUp(url: string) {
  try {
    const response = await fetch(`healthcheck-${url}`, url, {
      retry: {
        enabled: false,
      },
    });

    return response.ok;
  } catch (e) {
    return false;
  }
}
