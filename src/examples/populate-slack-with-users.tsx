import { slack } from "@trigger.dev/integrations";
import { customEvent, Trigger } from "@trigger.dev/sdk";
import { z } from "zod";

const users = [
  { name: "Liam Johnson", email: "liam.johnson@github.com" },
  { name: "Ava Williams", email: "ava.williams@aws.com" },
  { name: "Noah Brown", email: "noah.brown@digitalocean.com" },
  { name: "Ethan Jones", email: "ethan.jones@cloudflare.com" },
  { name: "Isabella Miller", email: "isabella.miller@bitbucket.com" },
  { name: "Mia Davis", email: "mia.davis@jetbrains.com" },
  { name: "Jacob Garcia", email: "jacob.garcia@datadog.com" },
  { name: "Michael Rodriguez", email: "michael.rodriguez@twilio.com" },
  { name: "Emily Wilson", email: "emily.wilson@stripe.com" },
  { name: "Madison Anderson", email: "madison.anderson@gitlab.com" },
  { name: "Sofia Thompson", email: "sofia.thompson@sentry.com" },
  { name: "Benjamin Moore", email: "benjamin.moore@circleci.com" },
  { name: "Abigail Martinez", email: "abigail.martinez@travis-ci.com" },
  { name: "Avery Robinson", email: "avery.robinson@heroku.com" },
  { name: "Evelyn Clark", email: "evelyn.clark@salesforce.com" },
  { name: "Aiden Lewis", email: "aiden.lewis@docker.com" },
  { name: "Madison Green", email: "madison.green@kubernetes.io" },
  { name: "Nicholas Baker", email: "nicholas.baker@nginx.com" },
  { name: "William Nelson", email: "william.nelson@postgresql.org" },
];

new Trigger({
  id: "new-users",
  name: "New users",
  apiKey: "trigger_development_hOOzMfDV2G04",
  on: customEvent({
    name: "slack.new.user",
    schema: z.object({}),
  }),
  async run(event, context) {
    for (let index = 0; index < users.length; index++) {
      const user = users[index];
      await slack.postMessage(`new-user-${index}`, {
        channelName: "new-users",
        text: `New user signed up: ${user.name} (${user.email})`,
      });
      await context.waitFor(`wait-${index}`, {
        seconds: 30 + Math.random() * 47,
      });
    }
  },
}).listen();
