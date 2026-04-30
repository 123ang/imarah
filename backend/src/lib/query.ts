import { z } from "zod";

export function routeParam(value: string | string[] | undefined): string | undefined {
  if (value === undefined) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

export const queryBoolean = z
  .enum(["true", "false"])
  .transform((v) => v === "true")
  .optional();
