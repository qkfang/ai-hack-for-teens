import { APIEndpoint } from "@/app/lib/schema";

import * as todoAppSchema from "@/samples/idea-spark-app/schema";

export interface SampleSchema {
  sampleName: string;
  sampleDescription: string;
  apiEndpoints: APIEndpoint[];
  dataTypes: string;
  generateApiDocumentation: () => string;
}

const schemaRegistry: Record<string, SampleSchema> = {
  "idea-spark-app": todoAppSchema,
};

export function getActiveSampleName(): string {
  return process.env.SAMPLE_NAME || "idea-spark-app";
}

export function getActiveSchema(): SampleSchema {
  const sampleName = getActiveSampleName();
  const schema = schemaRegistry[sampleName];
  if (!schema) {
    console.warn(`[Schema Registry] Sample "${sampleName}" not found, falling back to idea-spark-app`);
    return schemaRegistry["idea-spark-app"];
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
