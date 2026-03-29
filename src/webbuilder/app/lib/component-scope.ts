import React, { useState, useEffect, useCallback, useMemo } from "react";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger" | "success";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  className?: string;
}

function Button({ children, onClick, variant = "primary", size = "md", disabled = false, className = "" }: ButtonProps) {
  const variantStyles = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300",
    danger: "bg-red-600 text-white hover:bg-red-700",
    success: "bg-green-600 text-white hover:bg-green-700",
  };
  const sizeStyles = { sm: "px-3 py-1.5 text-sm", md: "px-4 py-2 text-base", lg: "px-6 py-3 text-lg" };
  return React.createElement("button", {
    onClick, disabled,
    className: `font-medium rounded-lg transition-colors ${variantStyles[variant]} ${sizeStyles[size]} ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`,
  }, children);
}

function Card({ children, title, className = "" }: { children: React.ReactNode; title?: string; className?: string }) {
  return React.createElement("div", { className: `bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 ${className}` },
    title && React.createElement("h3", { className: "text-lg font-semibold mb-4" }, title),
    children);
}

function Input({ value, onChange, placeholder = "", type = "text", className = "" }: {
  value: string; onChange: (value: string) => void; placeholder?: string; type?: string; className?: string;
}) {
  return React.createElement("input", {
    type, value, placeholder,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value),
    className: `w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 ${className}`,
  });
}

function Select({ value, onChange, options, placeholder, className = "" }: {
  value: string; onChange: (value: string) => void;
  options: { value: string; label: string }[]; placeholder?: string; className?: string;
}) {
  return React.createElement("select", {
    value,
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => onChange(e.target.value),
    className: `w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 ${className}`,
  },
    placeholder && React.createElement("option", { value: "" }, placeholder),
    options.map((opt) => React.createElement("option", { key: opt.value, value: opt.value }, opt.label)));
}

function Badge({ children, color = "blue" }: { children: React.ReactNode; color?: string }) {
  const colorStyles: Record<string, string> = {
    blue: "bg-blue-100 text-blue-800", green: "bg-green-100 text-green-800",
    red: "bg-red-100 text-red-800", yellow: "bg-yellow-100 text-yellow-800",
    gray: "bg-gray-100 text-gray-800", purple: "bg-purple-100 text-purple-800",
  };
  return React.createElement("span", {
    className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorStyles[color] || colorStyles.blue}`,
  }, children);
}

function Checkbox({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return React.createElement("label", { className: "flex items-center gap-2 cursor-pointer" },
    React.createElement("input", {
      type: "checkbox", checked,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.checked),
      className: "w-4 h-4 text-blue-600 rounded",
    }),
    label && React.createElement("span", { className: "text-gray-700" }, label));
}

function List({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return React.createElement("ul", { className: `space-y-2 ${className}` }, children);
}

function ListItem({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return React.createElement("li", { className: `p-3 bg-gray-50 dark:bg-gray-700 rounded-lg ${className}` }, children);
}

function Header({ children, level = 1, className = "" }: { children: React.ReactNode; level?: 1 | 2 | 3; className?: string }) {
  const sizeStyles = { 1: "text-3xl font-bold", 2: "text-2xl font-semibold", 3: "text-xl font-medium" };
  return React.createElement(`h${level}`, { className: `${sizeStyles[level]} text-gray-900 dark:text-white ${className}` }, children);
}

function Spinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeStyles = { sm: "w-4 h-4", md: "w-6 h-6", lg: "w-8 h-8" };
  return React.createElement("div", { className: `${sizeStyles[size]} animate-spin rounded-full border-2 border-gray-300 border-t-blue-600` });
}

function Flex({ children, direction = "row", gap = 2, align = "start", justify = "start", className = "" }: {
  children: React.ReactNode; direction?: "row" | "col"; gap?: number;
  align?: string; justify?: string; className?: string;
}) {
  const alignStyles: Record<string, string> = { start: "items-start", center: "items-center", end: "items-end", stretch: "items-stretch" };
  const justifyStyles: Record<string, string> = { start: "justify-start", center: "justify-center", end: "justify-end", between: "justify-between", around: "justify-around" };
  const gapStyles: Record<number, string> = { 0: "gap-0", 1: "gap-1", 2: "gap-2", 3: "gap-3", 4: "gap-4", 5: "gap-5", 6: "gap-6", 8: "gap-8" };
  return React.createElement("div", {
    className: `flex ${direction === "col" ? "flex-col" : "flex-row"} ${gapStyles[gap] || "gap-2"} ${alignStyles[align] || ""} ${justifyStyles[justify] || ""} ${className}`,
  }, children);
}

async function fetchAPI(endpoint: string, options?: { method?: string; body?: unknown }): Promise<unknown> {
  const url = endpoint.startsWith("/api/") ? endpoint : `/api/${endpoint}`;
  if (!url.startsWith("/api/")) throw new Error("Only /api/* endpoints are allowed");
  const response = await fetch(url, {
    method: options?.method || "GET",
    headers: options?.body ? { "Content-Type": "application/json" } : undefined,
    body: options?.body ? JSON.stringify(options.body) : undefined,
  });
  return response.json();
}

export const componentScope = {
  React, useState, useEffect, useCallback, useMemo,
  Button, Card, Input, Select, Badge, Checkbox, List, ListItem, Header, Spinner, Flex,
  fetchAPI,
  console: {
    log: (...args: unknown[]) => console.log("[DynamicUI]", ...args),
    error: (...args: unknown[]) => console.error("[DynamicUI]", ...args),
  },
};

export type ComponentScope = typeof componentScope;
