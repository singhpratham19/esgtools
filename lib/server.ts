import { randomUUID } from "crypto";

export function createId(prefix: string) {
  return `${prefix}-${randomUUID().slice(0, 8)}`;
}

export function timestamp() {
  return new Date().toISOString().slice(0, 16).replace("T", " ");
}
