"use client";

import React, { useEffect } from "react";

interface DynamicRendererProps {
  code: string;
  onError?: (error: string) => void;
  onSuccess?: () => void;
  fallback?: React.ReactNode;
}

export default function DynamicRenderer({
  code,
  onError,
  onSuccess,
  fallback,
}: DynamicRendererProps) {
  useEffect(() => {
    if (code && code.trim() !== "") {
      onSuccess?.();
    }
  }, [code, onSuccess]);

  if (!code || code.trim() === "") {
    return (
      fallback || (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
          No HTML to render
        </div>
      )
    );
  }

  return (
    <iframe
      srcDoc={code}
      sandbox="allow-scripts allow-forms allow-modals"
      className="w-full border-0 rounded"
      style={{ minHeight: "600px", height: "100%" }}
      title="HTML Preview"
    />
  );
}
