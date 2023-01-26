import { resend, slack } from "@trigger.dev/integrations";
import { customEvent, Trigger } from "@trigger.dev/sdk";
import React from "react";
import { z } from "zod";
import { getUser } from "../db";
import { InactiveEmail, TipsEmail, WelcomeEmail } from "./email-templates";
import dotenv from "dotenv";
dotenv.config();

new Trigger({
  id: "welcome-email-campaign",
  name: "Welcome email drip campaign",
  on: customEvent({
    name: "user.created",
    schema: z.object({
      userId: z.string(),
    }),
  }),
  async run(event, context) {
    //get the user data from the database
    const user = await getUser(event.userId);

    await slack.postMessage("send-to-slack", {
      channelName: "new-users",
      text: `New user signed up: ${user.name} (${user.email})`,
    });

    //Send the first email
    const welcomeResponse = await resend.sendEmail("welcome-email", {
      from: "Trigger.dev <james@email.trigger.dev>",
      replyTo: "James <james@trigger.dev>",
      to: user.email,
      subject: "Welcome to Trigger.dev",
      react: <WelcomeEmail name={user.name} />,
    });
    await context.logger.debug(
      `Sent welcome email to ${welcomeResponse.to} with id ${welcomeResponse.id}`
    );

    //wait 1 day, check if the user has created a workflow and send the appropriate email
    await context.waitFor("wait-a-while", { seconds: 10 });
    const updatedUser = await getUser(event.userId);

    if (updatedUser.hasOnboarded) {
      await resend.sendEmail("onboarding-complete", {
        from: "Trigger.dev <james@email.trigger.dev>",
        replyTo: "James <james@trigger.dev>",
        to: updatedUser.email,
        subject: "Pro tips for workflows",
        react: <TipsEmail name={updatedUser.name} />,
      });
    } else {
      await resend.sendEmail("onboarding-incomplete", {
        from: "Trigger.dev <james@email.trigger.dev>",
        replyTo: "James <james@trigger.dev>",
        to: updatedUser.email,
        subject: "Help with your first workflow",
        react: <InactiveEmail name={updatedUser.name} />,
      });
    }
  },
}).listen();
