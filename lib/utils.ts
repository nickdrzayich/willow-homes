import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9.\-_]/g, "_")
}

export function isPdfFileName(name: string) {
  return name.toLowerCase().endsWith(".pdf")
}

// Formats a "YYYY-MM-DD" date string as "Wednesday November 18 2026".
// The T00:00:00 suffix keeps the date parsed in local time instead of UTC,
// which otherwise shows the wrong day in timezones behind UTC.
export function formatLogDate(dateStr: string) {
  const date = new Date(`${dateStr}T00:00:00`)
  const weekday = date.toLocaleDateString("en-US", { weekday: "long" })
  const month = date.toLocaleDateString("en-US", { month: "long" })
  return `${weekday} ${month} ${date.getDate()} ${date.getFullYear()}`
}
