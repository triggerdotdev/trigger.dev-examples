import { Button } from "@react-email/button";
import { Head } from "@react-email/head";
import { Html } from "@react-email/html";
import { Img } from "@react-email/img";
import { Link } from "@react-email/link";
import { Preview } from "@react-email/preview";
import { Section } from "@react-email/section";
import { Text } from "@react-email/text";
import { Tailwind } from "@react-email/tailwind";
import React from "react";
import { PipedriveDeal } from "./scheduled-pipedrive";
import { Column } from "@react-email/column";
import { Container } from "@react-email/container";

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

const button = {
  backgroundColor: "#2754C5",
  color: "#fff",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: "16px",
  padding: "6px 14px",
  borderRadius: "4px",
};

const anchor = {
  color: "#2754C5",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: "16px",
  textDecoration: "underline",
};

export function ReportEmail({
  pipeDriveDeals,
}: {
  pipeDriveDeals?: PipedriveDeal[];
}) {
  if (!pipeDriveDeals) {
    return (
      <Html>
        <Head />
        <Preview>{`No active Pipedrive deals`}</Preview>
        <Section style={main}>
          There are currently no active Pipedrive deals
        </Section>
      </Html>
    );
  }

  return (
    <Html>
      <Head />
      <Preview>{`${pipeDriveDeals.length} active Pipedrive deals`}</Preview>
      <Tailwind>
        <Container>
          <Section>
            <Text className="text-2xl text-slate-800 mb-4">
              Active Pipedrive deals
            </Text>
          </Section>
          <Section className="bg-white pb-8">
            {pipeDriveDeals.map((deal) => (
              <Section key={deal.id}>
                <Column className="text-lg text-slate-800">{deal.title}</Column>
                <Column className="text-slate-500">
                  {`${deal.currency}${deal.value}`}
                </Column>
                <Column>
                  <Button
                    href={`https://triggerdev2.pipedrive.com/deal/${deal.id}`}
                    className="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg"
                  >
                    View
                  </Button>
                </Column>
              </Section>
            ))}
          </Section>
        </Container>
      </Tailwind>
    </Html>
  );
}
