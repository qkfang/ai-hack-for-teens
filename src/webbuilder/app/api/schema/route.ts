import { NextResponse } from "next/server";
import { componentDefinitions, generateSchemaDocumentation } from "@/app/lib/schema";
import { getActiveSchema, getActiveSampleName, getAvailableSamples } from "@/app/lib/schema-registry";

export async function GET() {
  const sampleName = getActiveSampleName();
  const sampleSchema = getActiveSchema();
  const apiDoc = sampleSchema.generateApiDocumentation();
  const fullDocumentation = generateSchemaDocumentation(apiDoc, sampleSchema.dataTypes);

  return NextResponse.json({
    components: componentDefinitions,
    apis: sampleSchema.apiEndpoints,
    types: { dataTypes: sampleSchema.dataTypes },
    documentation: fullDocumentation,
    hooks: ["useState", "useEffect", "useCallback", "useMemo"],
    utilities: ["fetchAPI", "console.log", "console.error"],
    sample: sampleName,
    sampleDescription: sampleSchema.sampleDescription,
    availableSamples: getAvailableSamples(),
  });
}
