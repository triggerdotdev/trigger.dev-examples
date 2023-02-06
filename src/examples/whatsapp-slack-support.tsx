/** @jsxImportSource jsx-slack */
import { Trigger } from "@trigger.dev/sdk";
import {
  events,
  sendText,
  getMediaUrl,
  MessageEventMessage,
} from "@trigger.dev/whatsapp";
import JSXSlack, {
  Actions,
  Blocks,
  Button,
  Section,
  Header,
  Context,
  Image,
  Modal,
  Input,
  Textarea,
} from "jsx-slack";
import * as slack from "@trigger.dev/slack";
import dotenv from "dotenv";
dotenv.config();

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  timeStyle: "short",
  dateStyle: "short",
});

// this trigger listens for WhatsApp messages and sends them to Slack
new Trigger({
  id: "whatsapp-to-slack",
  name: "WhatsApp: load messages",
  logLevel: "debug",
  on: events.messageEvent({
    accountId: "114848614845931",
  }),
  endpoint: process.env.TRIGGER_ENDPOINT_URL,
  run: async (event, ctx) => {
    ctx.logger.debug("event", event);

    //this generates Slack blocks from the WhatsApp message
    const messageBody = await createMessageBody(event.message);

    await slack.postMessage("jsx-test", {
      channelName: "whatsapp-support",
      //text appears in Slack notifications on mobile/desktop
      text: "How is your progress today?",
      //import and use JSXSlack to make creating rich messages much easier
      blocks: JSXSlack(
        <Blocks>
          <Header>From: {event.message.from}</Header>
          <Context>At: {dateFormatter.format(event.message.timestamp)}</Context>
          {messageBody}
          <Actions blockId="launch-modal">
            <Button value="reply" actionId="reply">
              Reply
            </Button>
          </Actions>
        </Blocks>
      ),
      //pass the WhatsApp message to the next trigger
      metadata: {
        whatsAppMessage: event.message,
      },
    });
  },
}).listen();

//this trigger creates a Slack modal when a user presses the Reply button
new Trigger({
  id: "whatsapp-to-slack-modal",
  name: "WhatsApp: show message composer",
  logLevel: "debug",
  on: slack.events.blockActionInteraction({
    blockId: "launch-modal",
  }),
  endpoint: process.env.TRIGGER_ENDPOINT_URL,
  run: async (event, ctx) => {
    if (!event.trigger_id) {
      await ctx.logger.error("No trigger_id", { event });
      return;
    }

    //get the action (presing the reply button) and the original WhatsApp message
    const action = event.actions[0];
    const whatsAppMessage =
      event.message?.metadata?.event_payload.whatsAppMessage;

    //generate Slack blocks from the WhatsApp message
    const messageBody = await createMessageBody(whatsAppMessage);

    if (action.action_id === "reply" && action.type === "button") {
      //show a reply modal, with the original message and an input field for the reply
      await slack.openView(
        "Opening view",
        event.trigger_id,
        JSXSlack(
          <Modal title="Your reply" close="Cancel" callbackId="submit-message">
            <Header>Original message</Header>
            {messageBody}
            <Header>Your reply</Header>
            <Textarea
              name="message"
              label="Message"
              placeholder="Your message"
              maxLength={500}
              id="messageField"
            />
            <Input type="submit" value="submit" />
          </Modal>
        ),
        {
          onSubmit: "close",
          //pass the original WhatsApp message to the next trigger, and the original Slack message so we can thread replies
          metadata: {
            whatsAppMessage,
            thread_ts: event.message?.ts,
          },
        }
      );
    }
  },
}).listen();

//this trigger sends the reply from Slack to WhatsApp
new Trigger({
  id: "whatsapp-composed-slack-message",
  name: "WhatsApp: send message from Slack",
  logLevel: "debug",
  on: slack.events.viewSubmissionInteraction({
    callbackId: "submit-message",
  }),
  endpoint: process.env.TRIGGER_ENDPOINT_URL,
  run: async (event, ctx) => {
    await ctx.logger.info("Modal submission", { event });

    //the message from the input field in Slack
    const usersResponse = event.view.state?.values.messageField.message
      .value as string;

    //get the data from the previous messages/panels
    const privateMetadata =
      event.view.private_metadata && JSON.parse(event.view.private_metadata);
    await ctx.logger.info("Private metadata", privateMetadata);
    const whatsAppMessage = privateMetadata?.whatsAppMessage;

    if (!whatsAppMessage || !usersResponse) {
      await ctx.logger.error("No message or original message", { event });
      return;
    }

    //send WhatsApp message
    await sendText("send-whatsapp", {
      fromId: "102119172798864",
      to: whatsAppMessage.from,
      text: usersResponse,
    });

    //send message in the Slack thread
    await slack.postMessage("slack-reply", {
      channelName: "whatsapp-support",
      text: `Replied with: ${usersResponse}`,
      blocks: JSXSlack(
        <Blocks>
          <Header>Reply from @{event.user.username}</Header>
          <Context>
            At: {dateFormatter.format(new Date())} To: {whatsAppMessage.from}
          </Context>
          <Section>{usersResponse}</Section>
        </Blocks>
      ),
      thread_ts: privateMetadata?.thread_ts,
    });

    return event;
  },
}).listen();

//creates different Slack blocks depending on the type of WhatsApp message (e.g. text, image, etc.)
async function createMessageBody(message: MessageEventMessage) {
  switch (message.type) {
    case "text": {
      return <Section>{message.text.body}</Section>;
    }
    case "image": {
      const mediaUrl = await getMediaUrl(`getImageUrl`, message.image);
      return (
        <Image
          src={mediaUrl}
          alt={message.image.caption ?? ""}
          title={message.image.caption ?? ""}
        />
      );
    }
    case "video": {
      const mediaUrl = await getMediaUrl(`getVideoUrl`, message.video);
      return <Section>{mediaUrl}</Section>;
    }
    default:
      return <Section>Unsupported message type: {message.type}</Section>;
  }
}
