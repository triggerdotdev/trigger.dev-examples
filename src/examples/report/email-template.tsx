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
import { PipedriveDeal, PipedriveStages } from "./scheduled-pipedrive";
import { Column } from "@react-email/column";
import { Container } from "@react-email/container";

export function ReportEmail({
  pipeDriveDeals,
  stages,
}: {
  pipeDriveDeals?: PipedriveDeal[];
  stages?: PipedriveStages;
}) {
  if (!pipeDriveDeals) {
    return (
      <Html>
        <Head />
        <Preview>{`No active Pipedrive deals`}</Preview>
        <Section className="text-3xl text-slate-800 p-12">
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
            <Text className="text-3xl text-slate-800 mb-4">
              Active Pipedrive deals
            </Text>
          </Section>
          <Section className="bg-white pb-8">
            {pipeDriveDeals.map((deal) => {
              const stage = stages?.[deal.stage_id];

              return (
                <Section key={deal.id}>
                  <Column>
                    <Text className="text-2xl text-slate-800 leading-3">
                      {deal.title}
                    </Text>
                    <Text className="text-slate-500 leading-1">
                      Value: {`${deal.formatted_value}`}
                      <br />
                      Contact: {`${deal.person_name}`}
                    </Text>
                  </Column>
                  <Column>
                    <Text className="text-white text-xs py-1 px-2 rounded-lg uppercase bg-slate-400 inline mr-2">
                      {stage?.name}
                    </Text>
                    <Button
                      href={`https://triggerdev2.pipedrive.com/deal/${deal.id}`}
                      className="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg"
                    >
                      View
                    </Button>
                  </Column>
                </Section>
              );
            })}
          </Section>
        </Container>
      </Tailwind>
    </Html>
  );
}
