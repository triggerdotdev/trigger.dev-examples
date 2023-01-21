import { slack } from "@trigger.dev/integrations";
import { customEvent, Trigger } from "@trigger.dev/sdk";
import React from "react";
import { z } from "zod";

new Trigger({
  id: "welcome-email-campaign",
  name: "Welcome email drip campaign",
  apiKey: "trigger_development_mLpn9DEEqCRR",
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
      text: `New user created: ${user.name} (${user.email})`,
    });

    //wait 5 minutes then send the first email
    await context.waitFor("5-minutes", { minutes: 5 });
    await resend.sendEmail("welcome-email", {
      from: "matt@trigger.dev",
      to: user.email,
      subject: "Welcome to Trigger.dev",
      react: <WelcomeEmail name={user.name} />,
    });

    //wait 1 day, check if the user has onboarded and send the appropriate email
    await context.waitFor("1-day", { days: 1 });
    const updatedUser = await getUser(event.userId);
    if (updatedUser.hasOnboarded) {
      await resend.sendEmail("onboarding-complete", {
        from: "matt@trigger.dev",
        to: updatedUser.email,
        subject: "Pro tips for workflows",
        react: <TipsEmail name={updatedUser.name} />,
      });
    } else {
      await resend.sendEmail("onboarding-incomplete", {
        from: "matt@trigger.dev",
        to: updatedUser.email,
        subject: "Help with your first workflow",
        react: <InactiveEmail name={updatedUser.name} />,
      });
    }

    //etc...
  },
});

async function getUser(userId: string) {
  return {
    id: userId,
    name: "Matt Aitken",
    email: "matt@mattaitken.com",
    hasOnboarded: false,
  };
}

const resend = {
  sendEmail: async (
    id: string,
    {
      from,
      to,
      subject,
      react,
    }: {
      from: string;
      to: string;
      subject: string;
      react: React.ReactNode;
    }
  ) => {
    return;
  },
};

function WelcomeEmail({ name }: { name: string }) {
  return (
    <div>
      <h1>Welcome to Trigger.dev</h1>
      <p>Hi {name}</p>
    </div>
  );
}

function TipsEmail({ name }: { name: string }) {
  return (
    <div>
      <h1>Welcome to Trigger.dev</h1>
      <p>Hi {name}</p>
    </div>
  );
}

function InactiveEmail({ name }: { name: string }) {
  return (
    <div>
      <h1>Welcome to Trigger.dev</h1>
      <p>Hi {name}</p>
    </div>
  );
}
