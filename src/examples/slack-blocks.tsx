/** @jsxImportSource jsx-slack */
import * as slack from "@trigger.dev/slack";
import { scheduleEvent, Trigger } from "@trigger.dev/sdk";
import JSXSlack, {
  Actions,
  Blocks,
  Button,
  Section,
  Select,
  Option,
} from "jsx-slack";
import dotenv from "dotenv";
dotenv.config();

const BLOCK_ID = "issue.action.block";

//1. every minute see how your employees are doing, we don't recommend this frequency 😉
new Trigger({
  id: "slack-interactivity",
  name: "Testing Slack Interactivity",
  on: scheduleEvent({
    rateOf: {
      hours: 1,
    },
  }),
  endpoint: process.env.TRIGGER_ENDPOINT_URL,
  run: async (event, ctx) => {
    await slack.postMessage("jsx-test", {
      channelName: "test-integrations",
      //text appears in Slack notifications on mobile/desktop
      text: "How is your progress today?",
      //import and use JSXSlack to make creating rich messages much easier
      blocks: JSXSlack(
        <Blocks>
          <Section>How is your progress today?</Section>
          <Actions blockId={BLOCK_ID}>
            <Button value="blocked" actionId="status-blocked">
              I'm blocked
            </Button>
            <Button
              value="help"
              actionId="status-help"
              url="https://xkcd.com/1349/"
            >
              Get help
            </Button>
            <Select actionId="rating" placeholder="Rate it!">
              <Option value="5">5 {":star:".repeat(5)}</Option>
              <Option value="4">4 {":star:".repeat(4)}</Option>
              <Option value="3">3 {":star:".repeat(3)}</Option>
              <Option value="2">2 {":star:".repeat(2)}</Option>
              <Option value="1">1 {":star:".repeat(1)}</Option>
            </Select>
          </Actions>
        </Blocks>
      ),
    });
  },
}).listen();

//2. this workflow listens for Slack interactions filtered by the block id and actions we used above
new Trigger({
  id: "slack-block-interaction",
  name: "Slack Block Interaction",
  on: slack.events.blockActionInteraction({
    blockId: BLOCK_ID,
    actionId: ["status-blocked", "status-help", "rating"],
  }),
  endpoint: process.env.TRIGGER_ENDPOINT_URL,
  run: async (event, ctx) => {
    //create promises from all the actions
    const promises = event.actions.map((action) => {
      switch (action.action_id) {
        case "status-blocked": {
          //the user is blocked so add a 😢 emoji as a reaction
          if (event.message) {
            return slack.addReaction("React to message", {
              name: "cry",
              timestamp: event.message.ts,
              channelId: event.channel.id,
            });
          }
          break;
        }
        case "status-help": {
          //the user needs help so add an 🆘 emoji as a reaction
          if (event.message) {
            return slack.addReaction("React to message", {
              name: "sos",
              timestamp: event.message.ts,
              channelId: event.channel.id,
            });
          }
          break;
        }
        case "rating": {
          if (action.type != "static_select") {
            throw new Error("This action should be a select");
          }

          //post the rating as a message that appears below the original,
          //only the user pressing the button will see this message
          return slack.postMessageResponse(
            "Added a comment to the issue",
            event.response_url,
            {
              text: `You rated your day ${action.selected_option?.value} stars`,
              replace_original: false,
            }
          );
        }
        default:
          return Promise.resolve();
      }
    });

    await Promise.all(promises);
  },
}).listen();
