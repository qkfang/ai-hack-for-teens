import { APIEndpoint } from "@/app/lib/schema";

export const sampleName = "startup-app";
export const sampleDescription = "Build your million-dollar AI startup idea website";

export const apiEndpoints: APIEndpoint[] = [
  {
    path: "/api/samples/todos",
    method: "GET",
    description: "Get all todos, optionally filtered by category or due date",
    parameters: [
      { name: "category", type: "string", in: "query", required: false, description: "Filter by category" },
      { name: "dueDate", type: "string (ISO date)", in: "query", required: false, description: "Filter by due date" },
    ],
    response: { type: "{ todos: Todo[], count: number, categories: string[] }", description: "List of todos" },
  },
  {
    path: "/api/samples/todos",
    method: "POST",
    description: "Create a new todo item",
    parameters: [
      { name: "title", type: "string", in: "body", required: true, description: "Todo title" },
      { name: "category", type: "string", in: "body", required: true, description: "Todo category" },
      { name: "dueDate", type: "string (ISO date)", in: "body", required: false, description: "Due date" },
    ],
    response: { type: "{ todo: Todo, message: string }", description: "Created todo item" },
  },
  {
    path: "/api/samples/todos",
    method: "PATCH",
    description: "Update a todo item",
    parameters: [
      { name: "id", type: "string", in: "body", required: true, description: "Todo ID" },
      { name: "title", type: "string", in: "body", required: false, description: "New title" },
      { name: "completed", type: "boolean", in: "body", required: false, description: "Completion status" },
    ],
    response: { type: "{ todo: Todo, message: string }", description: "Updated todo item" },
  },
  {
    path: "/api/samples/todos",
    method: "DELETE",
    description: "Delete a todo",
    parameters: [
      { name: "id", type: "string", in: "query", required: false, description: "Todo ID to delete" },
    ],
    response: { type: "{ message: string }", description: "Deletion confirmation" },
  },
];

export const dataTypes = `
interface Todo {
  id: string;
  title: string;
  category: string;
  dueDate: string;
  completed: boolean;
  createdAt: string;
}
`;

export function generateApiDocumentation(): string {
  let doc = `## ${sampleDescription}\n\n`;
  doc += "### API Endpoints\n\n";
  for (const api of apiEndpoints) {
    doc += `#### ${api.method} ${api.path}\n`;
    doc += `${api.description}\n\n`;
    if (api.parameters && api.parameters.length > 0) {
      doc += "Parameters:\n";
      for (const param of api.parameters) {
        doc += `- \`${param.name}\` (${param.in}): ${param.type}${param.required ? " (required)" : ""} - ${param.description}\n`;
      }
    }
    doc += `\nResponse: ${api.response.type}\n\n`;
  }
  doc += "### Data Types\n\n```typescript\n" + dataTypes + "```\n";
  return doc;
}
