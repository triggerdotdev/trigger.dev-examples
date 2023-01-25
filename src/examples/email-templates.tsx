import { Head } from "@react-email/head";
import { Html } from "@react-email/html";
import { Img } from "@react-email/img";
import { Link } from "@react-email/link";
import { Preview } from "@react-email/preview";
import { Section } from "@react-email/section";
import { Text } from "@react-email/text";
import React from "react";

const main = {
  backgroundColor: "#ffffff",
};

const bullets = {
  color: "#333",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  fontSize: "16px",
  lineHeight: "24px",
  textAlign: "left" as const,
  margin: "0",
};

const paragraph = {
  color: "#333",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  fontSize: "16px",
  lineHeight: "24px",
  textAlign: "left" as const,
};

const anchor = {
  color: "#2754C5",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: "16px",
  textDecoration: "underline",
};

export function WelcomeEmail({ name }: { name?: string }) {
  return (
    <Html>
      <Head />
      <Preview>You're now ready to create complex workflows in code!</Preview>
      <Section style={main}>
        <Text style={paragraph}>Hey {name ?? "there"},</Text>
        <Text style={paragraph}>
          I’m Matt, CEO of{" "}
          <Link style={anchor} href="https://app.trigger.dev/">
            Trigger.dev
          </Link>
          .
        </Text>
        <Text style={paragraph}>
          Our goal is to give developers like you the ability to easily create
          much more powerful workflows, directly from your codebase. Creating
          complex workflows should be the same as creating any other important
          part of your product, which is why we created Trigger.dev.
        </Text>

        <Text style={paragraph}>
          If you’re ready - you can{" "}
          <Link style={anchor} href="https://app.trigger.dev/">
            create a new workflow.
          </Link>{" "}
        </Text>

        <Text style={paragraph}>Otherwise, please feel free to check out:</Text>

        <Text style={bullets}>
          • Our{" "}
          <Link style={anchor} href="https://docs.trigger.dev/getting-started">
            quickstart guide
          </Link>{" "}
          to get you up and running in minutes
        </Text>

        <Text style={bullets}>
          • Explore our{" "}
          <Link style={anchor} href="https://docs.trigger.dev/">
            docs
          </Link>{" "}
          for a full overview of the product and it’s features{" "}
        </Text>

        <Text style={bullets}>
          •{" "}
          <Link style={anchor} href="https://cal.com/team/triggerdotdev/call">
            Schedule a call with us
          </Link>{" "}
          about a workflow idea you have.
        </Text>

        <Text style={paragraph}>
          Feel free to drop me a message if you have any further questions!
        </Text>
        <Text style={bullets}>Best,</Text>
        <Text style={bullets}>Matt</Text>
        <Text style={paragraph}>CEO, Trigger.dev</Text>
      </Section>
      <Img
        src="https://app.trigger.dev/build/_assets/logo-SITOLUB3.png"
        width="150px"
        height="auto"
      />
    </Html>
  );
}

export function TipsEmail({ name }: { name: string }) {
  return (
    <Html>
      <Preview>3 tips to get the most out of Trigger.dev</Preview>
      <Section>
        <Text style={paragraph}>Hi {name ?? "there"},</Text>
        <Text style={paragraph}>
          Thank you for signing up for Trigger.dev! I'm excited to have you on
          board and are confident we can help you streamline your development
          process.
        </Text>
        <Text style={paragraph}>
          To help you get the most out of our platform, I wanted to share a few
          tips with you:
        </Text>
        <Text style={bullets}>
          • Take advantage of our API integrations. You can connect to over 100
          APIs with easy authentication.
        </Text>
        <Text style={bullets}>
          • Schedule your workflow with ease using our delay feature. With just
          one line of code, you can set delays of up to one year. They survive
          server restarts and pickup where they left off.
        </Text>
        <Text style={bullets}>
          • Utilize our email API integration, Resend, to send automated emails
          to your customers based on specific events or scheduled drip campaigns
          and newsletters.
        </Text>
        <Text style={paragraph}>
          If you have any questions or need assistance, please do not hesitate
          to contact our support team. We are here to help you make the most of
          our platform.
        </Text>
        <Text style={paragraph}>
          Thank you for choosing trigger.dev. We look forward to helping you
          take your development to the next level.
        </Text>
        <Text style={paragraph}>Best regards,</Text>
        <Text style={paragraph}>Matt</Text>
        <Text style={paragraph}>CEO, Trigger.dev</Text>
      </Section>
      <Img
        src="https://app.trigger.dev/build/_assets/logo-SITOLUB3.png"
        width="150px"
        height="auto"
      />
    </Html>
  );
}

export function InactiveEmail({ name }: { name: string }) {
  return (
    <Html>
      <Preview>Don't miss out on the benefits of Trigger.dev!</Preview>
      <Section>
        <Text style={paragraph}>Hi {name ?? "there"},</Text>
        <Text style={paragraph}>
          We noticed that you haven't signed up for Trigger.dev yet. We
          understand that you're busy and have many options when it comes to
          development tools, but we want to remind you that Trigger is designed
          to make your workflow development process easier, faster, and more
          efficient.
        </Text>
        <Text style={paragraph}>
          With Trigger, you can create workflows easily in code, saving you time
          and effort. Plus, you'll have access to our community of developers
          who can provide support and share their own workflow solutions.
        </Text>
        <Text style={paragraph}>
          Don't miss out on the benefits of Trigger. Sign up now and start
          creating valuable workflows in no time.
        </Text>
        <Link style={anchor} href="https://trigger.dev">
          Sign Up Now
        </Link>
        <Text style={paragraph}>
          If you have any questions or concerns, please don't hesitate to reach
          out to us.
        </Text>

        <Text style={paragraph}>Best regards,</Text>
        <Text style={paragraph}>Matt</Text>
        <Text style={paragraph}>CEO, Trigger.dev</Text>
        <Text style={paragraph}>
          P.S. If you're not interested in our service, please let us know and
          we will remove your email from our mailing list.
        </Text>
      </Section>
      <Img
        src="https://app.trigger.dev/build/_assets/logo-SITOLUB3.png"
        width="150px"
        height="auto"
      />
    </Html>
  );
}
