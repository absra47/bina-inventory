import { randomBytes } from "crypto";

// Small, dependency-free unique id (sortable-ish, url-safe).
export function createId(): string {
  const time = Date.now().toString(36);
  const rand = randomBytes(8).toString("hex");
  return `${time}${rand}`;
}
