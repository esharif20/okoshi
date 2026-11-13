import type { Role } from "~/content";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2025-06" as "Jun 2025". */
export function monthYear(date: string): string {
  const [year, month] = date.split("-");
  return `${MONTHS[Number(month) - 1]} ${year}`;
}

/** A Role's dates as they are read: "Jun 2025 to Aug 2025", or "Oct 2026 to now". */
export function span(role: Pick<Role, "start" | "end">): string {
  return `${monthYear(role.start)} to ${role.end ? monthYear(role.end) : "now"}`;
}

export const yearOf = (date: string) => date.slice(0, 4);
