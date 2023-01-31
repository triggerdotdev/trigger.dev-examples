import { Trigger, scheduleEvent, customEvent, fetch } from "@trigger.dev/sdk";
import * as slack from "@trigger.dev/slack";
import { z } from "zod";
import { parseCvssVector } from "vuln-vects";
import dotenv from "dotenv";
dotenv.config();

export const vulnerabilitySchema = z
  .object({
    schema_version: z.string().optional(),
    id: z.string(),
    modified: z.string(),
    published: z.string().optional(),
    withdrawn: z.string().optional(),
    aliases: z.union([z.array(z.string()), z.null()]).optional(),
    related: z.array(z.string()).optional(),
    summary: z.string().optional(),
    details: z.string().optional(),
    severity: z
      .union([
        z.array(
          z.object({ type: z.enum(["CVSS_V2", "CVSS_V3"]), score: z.string() })
        ),
        z.null(),
      ])
      .optional(),
    affected: z
      .union([
        z.array(
          z.object({
            package: z
              .object({
                ecosystem: z.string(),
                name: z.string(),
                purl: z.string().optional(),
              })
              .optional(),
            severity: z
              .union([
                z.array(
                  z.object({
                    type: z.enum(["CVSS_V2", "CVSS_V3"]),
                    score: z.string(),
                  })
                ),
                z.null(),
              ])
              .optional(),
            ranges: z
              .array(
                z.object({
                  type: z.enum(["GIT", "SEMVER", "ECOSYSTEM"]),
                  repo: z.string().optional(),
                  events: z.array(z.object({}).catchall(z.any())).min(1),
                  database_specific: z.object({}).catchall(z.any()).optional(),
                })
              )
              .optional(),
            versions: z.array(z.string()).optional(),
            ecosystem_specific: z.object({}).catchall(z.any()).optional(),
            database_specific: z.object({}).catchall(z.any()).optional(),
          })
        ),
        z.null(),
      ])
      .optional(),
    references: z
      .union([
        z.array(
          z.object({
            type: z.enum([
              "ADVISORY",
              "ARTICLE",
              "REPORT",
              "FIX",
              "GIT",
              "PACKAGE",
              "EVIDENCE",
              "WEB",
            ]),
            url: z.string().url(),
          })
        ),
        z.null(),
      ])
      .optional(),
    credits: z
      .array(
        z.object({ name: z.string(), contact: z.array(z.string()).optional() })
      )
      .optional(),
    database_specific: z.object({}).catchall(z.any()).optional(),
  })
  .describe(
    "A schema for describing a vulnerability in an open source package."
  );

const queryResponseSchema = z.object({
  vulns: z.array(vulnerabilitySchema),
});

const batchQueryResponseSchema = z.object({
  results: z.array(queryResponseSchema),
});

type BatchQueryResponse = z.infer<typeof batchQueryResponseSchema>;

const packageSchema = z.object({
  name: z.string(),
  versions: z.record(
    z.object({
      name: z.string(),
      version: z.string(),
      description: z.string(),
    })
  ),
  "dist-tags": z.object({
    latest: z.string(),
  }),
});

type NPMPackageMetadata = z.infer<typeof packageSchema>;

// Workflow that notifies you of any critical issues in your GitHub repo using the osv.dev API
// Would need to be modified to save the vulnerabilities in a database and only notify you of new ones
new Trigger({
  id: "check-for-vulns",
  name: "Notify me of critical vulnerabilities in my GitHub repo",
  on: customEvent({
    name: "check.vulns",
    schema: z.object({ package: z.string() }),
  }),
  endpoint: process.env.TRIGGER_ENDPOINT_URL,
  run: async (event, ctx) => {
    const npmPackage = await getPackageMetadata(event.package);

    await ctx.logger.info(`Fetching vulnerabilities for ${npmPackage.name}`, {
      package: npmPackage,
    });

    const { results } = await batchQueryVulnerabilitiesForPackage(npmPackage);

    for (const batchResult of results) {
      for (const vuln of batchResult.vulns) {
        // If any of the vuln.severity scores are critical, send a notification
        if (
          vuln.severity &&
          vuln.severity.some(
            (severity) => parseCvssVector(severity.score).overallScore > 7.0
          )
        ) {
          await ctx.logger.info(`Found critical vulnerability`, {
            vulnerability: vuln,
          });

          await slack.postMessage(`Notifying about ${vuln.id}`, {
            channelName: "security-vulns",
            text: `Found critical vulnerability in ${npmPackage.name}: ${vuln.summary}`,
          });
        }
      }
    }
  },
}).listen();

// Check vulns every hour
new Trigger({
  id: "check-vulns-every-hour",
  name: "Check for vulnerabilities every hour",
  on: scheduleEvent({
    rateOf: {
      hours: 1,
    },
  }),
  endpoint: process.env.TRIGGER_ENDPOINT_URL,
  run: async (event, ctx) => {
    await ctx.sendEvent(`check.vulns`, {
      name: "check.vulns",
      payload: { package: `@trigger.dev/sdk` },
    });
  },
}).listen();

async function getPackageMetadata(
  packageName: string
): Promise<NPMPackageMetadata> {
  const packageResponse = await fetch(
    `GET ${packageName} metadata`,
    `https://registry.npmjs.org/${packageName}`,
    {
      method: "GET",
      responseSchema: packageSchema,
    }
  );

  const npmPackage = packageResponse.body;

  if (!npmPackage) {
    throw new Error(`Could not find package ${packageName}`);
  }

  return npmPackage;
}

async function batchQueryVulnerabilitiesForPackage(
  npmPackage: NPMPackageMetadata
): Promise<BatchQueryResponse> {
  const queries = Object.keys(npmPackage.versions).map((version) => ({
    version,
    package: { name: npmPackage.name, ecosystem: "npm" },
  }));

  const batchResponse = await fetch(
    "Batch query",
    "https://api.osv.dev/v1/querybatch",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: {
        queries,
      },
      responseSchema: batchQueryResponseSchema,
    }
  );

  if (!batchResponse.body) {
    throw new Error(`Could not find vulnerabilities for ${npmPackage.name}`);
  }

  return batchResponse.body;
}
