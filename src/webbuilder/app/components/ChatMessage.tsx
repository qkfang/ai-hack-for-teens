"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

function CollapsibleCodeBlock({ code, language }: { code: string; language: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const lineCount = code.split("\n").length;

  return (
    <div className="my-2 rounded-md overflow-hidden border border-slate-600">
      <div className="flex items-center justify-between px-3 py-2 bg-slate-900">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-xs text-gray-400 hover:text-gray-200 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
          <span className="font-mono">{language}</span>
          <span className="text-gray-500">• {lineCount} lines</span>
          <svg
            className={`h-4 w-4 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
      {isExpanded && (
        <SyntaxHighlighter
          style={oneDark}
          language={language}
          PreTag="div"
          customStyle={{ margin: 0, padding: "0.75rem", borderRadius: 0, fontSize: "0.75rem", maxHeight: "400px" }}
          showLineNumbers
          lineNumberStyle={{ color: "#6b7280", minWidth: "2em", paddingRight: "1em" }}
        >
          {code}
        </SyntaxHighlighter>
      )}
    </div>
  );
}

function MessageContent({ content, isStreaming }: { content: string; isStreaming?: boolean }) {
  // Strip dynamic-code tags for display purposes
  const displayContent = content.replace(/<dynamic-code>[\s\S]*?<\/dynamic-code>/g, "\n*[HTML page updated]*\n");

  return (
    <>
      <ReactMarkdown
        components={{
          code: ({ className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || "");
            const isInline = !match;
            const codeString = String(children).replace(/\n$/, "");
            return isInline ? (
              <code className="rounded bg-zinc-300 px-1 py-0.5 dark:bg-zinc-600 text-sm" {...props}>
                {children}
              </code>
            ) : (
              <CollapsibleCodeBlock code={codeString} language={match[1]} />
            );
          },
          pre: ({ children }) => <>{children}</>,
          ul: ({ children }) => <ul className="list-disc pl-4 my-2 space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-4 my-2 space-y-1">{children}</ol>,
          li: ({ children }) => <li className="text-sm">{children}</li>,
          strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
          p: ({ children }) => <p className="my-2">{children}</p>,
        }}
      >
        {displayContent}
      </ReactMarkdown>
      {isStreaming && <span className="ml-1 inline-block h-4 w-2 animate-pulse bg-zinc-500" />}
    </>
  );
}

export interface ToolExecution {
  id: string;
  name: string;
  status: "running" | "complete";
  arguments?: Record<string, unknown>;
  result?: string;
  success?: boolean;
  startTime?: string;
  endTime?: string;
}

export type ResponseStage = "starting" | "planning" | "working" | "complete";

export interface Message {
  id: string;
  role: "user" | "assistant" | "event";
  content: string;
  eventType?: string;
  toolExecutions?: ToolExecution[];
  isStreaming?: boolean;
  imageAttachments?: string[];
  stage?: ResponseStage;
  reasoning?: string;
  previousCode?: string;
}

function ToolExecutionItem({ tool }: { tool: ToolExecution }) {
  return (
    <div className="rounded-lg bg-slate-700 overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 text-xs">
        {tool.status === "running" ? (
          <svg className="w-4 h-4 animate-spin text-blue-400" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : tool.success === false ? (
          <span className="text-red-400">✗</span>
        ) : (
          <span className="text-green-400">✓</span>
        )}
        <span className="font-mono text-gray-200 flex-1">{tool.name}</span>
        {tool.status === "running" && <span className="text-gray-400">running...</span>}
      </div>
    </div>
  );
}

export default function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === "user";
  const isEvent = message.role === "event";

  if (!isUser && !isEvent && !message.content?.trim() && !message.stage) return null;

  if (isEvent && message.toolExecutions && message.toolExecutions.length > 0) {
    return (
      <div className="mb-3 flex justify-start">
        <div className="max-w-[85%] space-y-2 w-full">
          {message.toolExecutions.map((tool) => <ToolExecutionItem key={tool.id} tool={tool} />)}
        </div>
      </div>
    );
  }

  if (isEvent) return null;

  if (isUser) {
    return (
      <div className="flex justify-end mb-3">
        <div className="max-w-[80%] bg-green-600 text-white rounded-lg px-4 py-2">
          {message.imageAttachments && message.imageAttachments.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2">
              {message.imageAttachments.map((src, idx) => (
                <img key={idx} src={src} alt={`Attached image ${idx + 1}`} className="max-h-32 rounded-lg border border-green-400/50" />
              ))}
            </div>
          )}
          <p className="whitespace-pre-wrap text-sm">{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start mb-3">
      <div className="w-full bg-slate-700 text-gray-100 rounded-lg px-3 py-2">
        {message.stage && message.stage !== "complete" && (
          <div className="flex items-center gap-2 mb-2 text-xs text-gray-400">
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>
              {message.stage === "starting" && "Starting"}
              {message.stage === "planning" && "Planning"}
              {message.stage === "working" && "Working on it"}
            </span>
          </div>
        )}
        {message.content && message.content.trim() && (
          <div className="prose prose-sm prose-invert max-w-none text-sm [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
            <MessageContent content={message.content} isStreaming={message.isStreaming} />
          </div>
        )}
      </div>
    </div>
  );
}
