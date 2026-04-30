import { z } from "zod";

export const queryBoolean = z
  .enum(["true", "false"])
  .transform((v) => v === "true")
  .optional();
