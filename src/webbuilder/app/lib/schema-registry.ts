import { APIEndpoint } from "@/app/lib/schema";

import * as todoAppSchema from "@/samples/startup-app/schema";

export interface SampleSchema {
  sampleName: string;
  sampleDescription: string;
  apiEndpoints: APIEndpoint[];
  dataTypes: string;
  generateApiDocumentation: () => string;
}

const schemaRegistry: Record<string, SampleSchema> = {
  "startup-app": todoAppSchema,
};

export function getActiveSampleName(): string {
  return process.env.SAMPLE_NAME || "startup-app";
}

export function getActiveSchema(): SampleSchema {
  const sampleName = getActiveSampleName();
  const schema = schemaRegistry[sampleName];
  if (!schema) {
    console.warn(`[Schema Registry] Sample "${sampleName}" not found, falling back to startup-app`);
    return schemaRegistry["startup-app"];
  }
  return schema;
}

export function getAvailableSamples(): string[] {
  return Object.keys(schemaRegistry);
}

export function hasSample(sampleName: string): boolean {
  return sampleName in schemaRegistry;
}

export function getSampleSchema(sampleName: string): SampleSchema | undefined {
  return schemaRegistry[sampleName];
}
