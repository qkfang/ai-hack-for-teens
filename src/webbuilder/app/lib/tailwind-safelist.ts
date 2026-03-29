// Tailwind CSS safelist - ensures dynamic classes are included in the build
// These are common classes used by dynamically generated UI

export const safelistClasses = [
  // Colors
  "bg-blue-50", "bg-blue-100", "bg-blue-500", "bg-blue-600", "bg-blue-700",
  "bg-green-50", "bg-green-100", "bg-green-500", "bg-green-600", "bg-green-700",
  "bg-red-50", "bg-red-100", "bg-red-500", "bg-red-600", "bg-red-700",
  "bg-yellow-50", "bg-yellow-100", "bg-yellow-500",
  "bg-gray-50", "bg-gray-100", "bg-gray-200", "bg-gray-700", "bg-gray-800", "bg-gray-900",
  "bg-purple-50", "bg-purple-100", "bg-purple-500",
  "bg-amber-100", "bg-amber-900",
  // Text colors
  "text-blue-600", "text-blue-700", "text-blue-800",
  "text-green-600", "text-green-700", "text-green-800",
  "text-red-400", "text-red-500", "text-red-600",
  "text-gray-400", "text-gray-500", "text-gray-600", "text-gray-700",
  "text-amber-300", "text-amber-700",
  // Spacing
  "p-2", "p-3", "p-4", "p-6", "px-2", "px-3", "px-4", "px-6",
  "py-1", "py-2", "py-3", "py-4",
  "m-2", "m-4", "mt-2", "mt-4", "mb-2", "mb-4",
  "gap-1", "gap-2", "gap-3", "gap-4", "gap-6",
  // Borders
  "border", "border-2", "rounded", "rounded-lg", "rounded-xl", "rounded-full",
  // Flexbox
  "flex", "flex-col", "flex-row", "items-center", "justify-center", "justify-between",
  // Display
  "hidden", "block", "inline-block", "inline-flex",
  // Width/Height
  "w-4", "w-6", "w-8", "w-full", "h-4", "h-6", "h-8", "h-full",
  // Font
  "font-medium", "font-semibold", "font-bold",
  "text-xs", "text-sm", "text-base", "text-lg", "text-xl",
];
