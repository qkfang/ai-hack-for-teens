import { NextRequest, NextResponse } from "next/server";
import { writeFile, unlink, readdir } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";

type CopilotClient = import("@github/copilot-sdk").CopilotClient;
type CopilotSession = import("@github/copilot-sdk").CopilotSession;

async function loadSdk() {
  return await import("@github/copilot-sdk");
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ImageData {
  base64: string;
  mimeType: string;
}

const TEMP_PREFIX = "webbuilder-img-";
let tempImagePaths: string[] = [];

async function saveImageToTemp(image: ImageData): Promise<string> {
  const ext = image.mimeType.split("/")[1] || "png";
  const filename = `${TEMP_PREFIX}${randomUUID()}.${ext}`;
  const tempPath = join(tmpdir(), filename);
  await writeFile(tempPath, Buffer.from(image.base64, "base64"));
  tempImagePaths.push(tempPath);
  return tempPath;
}

async function cleanupTempImages(): Promise<void> {
  for (const path of tempImagePaths) {
    try { await unlink(path); } catch { /* ignore */ }
  }
  tempImagePaths = [];
  try {
    const tempDir = tmpdir();
    const files = await readdir(tempDir);
    for (const file of files) {
      if (file.startsWith(TEMP_PREFIX)) {
        try { await unlink(join(tempDir, file)); } catch { /* ignore */ }
      }
    }
  } catch { /* ignore */ }
}

interface PoolEntry {
  client: CopilotClient;
  session: CopilotSession | null;
}

const clientPool: PoolEntry[] = [];
let poolIndex = 0;
let poolInitPromise: Promise<void> | null = null;

async function initializePool(): Promise<void> {
  const { CopilotClient: Client } = await loadSdk();
  const tokens = (process.env.GH_TOKEN || "").split("|").map((t) => t.trim()).filter(Boolean);
  if (tokens.length === 0) {
    throw new Error("Not authenticated. Set GH_TOKEN environment variable.");
  }
  for (const token of tokens) {
    process.env.GH_TOKEN = token;
    const c = new Client();
    await c.start();
    const authStatus = await c.getAuthStatus();
    if (!authStatus.isAuthenticated) {
      console.warn(`[Copilot Pool] Token failed auth: ${authStatus.statusMessage}`);
      continue;
    }
    clientPool.push({ client: c, session: null });
  }
  if (clientPool.length === 0) {
    throw new Error("Not authenticated. Set GH_TOKEN environment variable.");
  }
}

async function getSession(): Promise<CopilotSession> {
  const { approveAll } = await loadSdk();
  if (!poolInitPromise) {
    poolInitPromise = initializePool();
  }
  await poolInitPromise;

  const idx = poolIndex;
  poolIndex = (poolIndex + 1) % clientPool.length;
  const entry = clientPool[idx];

  if (!entry.session) {
    entry.session = await entry.client.createSession({
      model: "claude-sonnet-4",
      streaming: true,
      onPermissionRequest: approveAll,
    });
    entry.session.on((event) => {
      if (event.type === "session.error") {
        console.error(`[Copilot SDK] Session error: ${event.data.message}`);
      }
    });
  }
  return entry.session;
}

export async function POST(request: NextRequest) {
  try {
    const { messages, dynamicMode, currentCode, images } = (await request.json()) as {
      messages: ChatMessage[];
      dynamicMode?: boolean;
      currentCode?: string;
      images?: ImageData[];
    };

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: "No messages provided" }, { status: 400 });
    }

    const currentSession = await getSession();
    const lastUserMessage = messages.filter((m) => m.role === "user").pop();
    if (!lastUserMessage) {
      return NextResponse.json({ error: "No user message found" }, { status: 400 });
    }

    const attachments: Array<{ type: "file"; path: string }> = [];
    if (images && images.length > 0) {
      for (const image of images) {
        const tempPath = await saveImageToTemp(image);
        attachments.push({ type: "file", path: tempPath });
      }
    }

    let prompt = lastUserMessage.content;

    if (dynamicMode) {
      prompt = `You are helping users build a static HTML page using HTML, CSS, and JavaScript.
The user will ask you to create or update the page. You should generate a complete, self-contained HTML page.

CRITICAL: You MUST ALWAYS output the complete HTML page wrapped in <dynamic-code> tags.

IMPORTANT RULES:
1. Generate a COMPLETE HTML page including <!DOCTYPE html>, <html>, <head>, and <body> tags
2. ALWAYS wrap your HTML in <dynamic-code> tags
3. Use only HTML, CSS, and JavaScript — you may load libraries from a CDN
4. NEVER suggest, generate, or discuss any backend code
5. NEVER respond with just a description. ALWAYS include the complete HTML.

CURRENT HTML:
\`\`\`html
${currentCode || "<!-- No current HTML -->"}
\`\`\`

User request: ${lastUserMessage.content}`;
    }

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        let finalContent = "";
        let messageId = "";
        let streamClosed = false;

        const timeoutId = setTimeout(() => {
          if (!streamClosed) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "error", message: "Request timed out" })}\n\n`));
            streamClosed = true;
            controller.close();
          }
        }, 120000);

        const closeStream = () => {
          if (!streamClosed) {
            streamClosed = true;
            clearTimeout(timeoutId);
            controller.close();
          }
        };

        const unsubscribe = currentSession.on((event) => {
          if (streamClosed) return;
          try {
            switch (event.type) {
              case "tool.execution_start":
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                  type: "tool.start",
                  toolId: event.data?.toolCallId || randomUUID(),
                  toolName: event.data?.toolName,
                  arguments: event.data?.arguments,
                })}\n\n`));
                break;
              case "tool.execution_complete":
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                  type: "tool.complete",
                  toolId: event.data?.toolCallId,
                  success: event.data?.success,
                  result: String(event.data?.result || "").substring(0, 500),
                })}\n\n`));
                break;
              case "assistant.reasoning_delta":
                if (event.data?.deltaContent) {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                    type: "reasoning", content: event.data.deltaContent,
                  })}\n\n`));
                }
                break;
              case "assistant.message_delta":
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "working" })}\n\n`));
                break;
              case "assistant.message":
                finalContent = event.data?.content || "";
                messageId = event.data?.messageId || "";
                break;
              case "session.idle":
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                  type: "done", content: finalContent, messageId,
                })}\n\n`));
                unsubscribe();
                closeStream();
                break;
              case "session.error":
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                  type: "error", message: event.data?.message || "Unknown error",
                })}\n\n`));
                unsubscribe();
                closeStream();
                break;
            }
          } catch (err) {
            console.error("[Copilot SDK] Error processing event:", err);
          }
        });

        try {
          await currentSession.send({
            prompt,
            attachments: attachments.length > 0 ? attachments : undefined,
          });
        } catch (err) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: "error",
            message: err instanceof Error ? err.message : "Failed to send message",
          })}\n\n`));
          unsubscribe();
          closeStream();
        }
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    for (const entry of clientPool) {
      entry.session = null;
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get response from Copilot" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  await cleanupTempImages();
  for (const entry of clientPool) {
    try {
      if (entry.session) await entry.session.destroy();
    } catch (error) {
      console.error("[Copilot API] Error destroying session:", error);
    }
    entry.session = null;
  }
  return NextResponse.json({ success: true });
}
