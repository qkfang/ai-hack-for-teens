export interface ComponentDefinition {
  name: string;
  description: string;
  props: {
    name: string;
    type: string;
    required: boolean;
    description: string;
  }[];
}

export interface APIEndpoint {
  path: string;
  method: "GET" | "POST" | "PATCH" | "DELETE";
  description: string;
  parameters?: {
    name: string;
    type: string;
    in: "query" | "body";
    required: boolean;
    description: string;
  }[];
  response: {
    type: string;
    description: string;
  };
}

export const componentDefinitions: ComponentDefinition[] = [
  {
    name: "Button",
    description: "A clickable button component",
    props: [
      { name: "children", type: "ReactNode", required: true, description: "Button content" },
      { name: "onClick", type: "() => void", required: false, description: "Click handler" },
      { name: "variant", type: "'primary' | 'secondary' | 'danger' | 'success'", required: false, description: "Button style variant" },
      { name: "size", type: "'sm' | 'md' | 'lg'", required: false, description: "Button size" },
      { name: "disabled", type: "boolean", required: false, description: "Disable the button" },
    ],
  },
  {
    name: "Card",
    description: "A container card with optional title",
    props: [
      { name: "children", type: "ReactNode", required: true, description: "Card content" },
      { name: "title", type: "string", required: false, description: "Card title" },
    ],
  },
  {
    name: "Input",
    description: "Text input field",
    props: [
      { name: "value", type: "string", required: true, description: "Input value" },
      { name: "onChange", type: "(value: string) => void", required: true, description: "Change handler" },
      { name: "placeholder", type: "string", required: false, description: "Placeholder text" },
    ],
  },
  {
    name: "Badge",
    description: "Small status badge/tag",
    props: [
      { name: "children", type: "ReactNode", required: true, description: "Badge content" },
      { name: "color", type: "'blue' | 'green' | 'red' | 'yellow' | 'gray' | 'purple'", required: false, description: "Badge color" },
    ],
  },
  {
    name: "Header",
    description: "Heading component (h1, h2, h3)",
    props: [
      { name: "children", type: "ReactNode", required: true, description: "Header text" },
      { name: "level", type: "1 | 2 | 3", required: false, description: "Heading level" },
    ],
  },
  {
    name: "Spinner",
    description: "Loading spinner animation",
    props: [
      { name: "size", type: "'sm' | 'md' | 'lg'", required: false, description: "Spinner size" },
    ],
  },
];

export function generateComponentDocumentation(): string {
  let doc = "## Available UI Components\n\n";
  for (const comp of componentDefinitions) {
    doc += `### ${comp.name}\n`;
    doc += `${comp.description}\n\n`;
    doc += "Props:\n";
    for (const prop of comp.props) {
      doc += `- \`${prop.name}\`: ${prop.type}${prop.required ? " (required)" : ""} - ${prop.description}\n`;
    }
    doc += "\n";
  }
  return doc;
}

export function generateSchemaDocumentation(sampleApiDoc?: string, sampleDataTypes?: string): string {
  let doc = generateComponentDocumentation();
  if (sampleApiDoc) doc += sampleApiDoc;
  if (sampleDataTypes) doc += "\n## Data Types\n\n```typescript\n" + sampleDataTypes + "```\n";
  return doc;
}
