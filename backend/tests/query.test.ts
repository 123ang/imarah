import test from "node:test";
import assert from "node:assert/strict";
import { z } from "zod";
import { queryBoolean } from "../src/lib/query.ts";

test("queryBoolean parses true and false explicitly", () => {
  const schema = z.object({ value: queryBoolean });
  assert.deepEqual(schema.parse({ value: "true" }), { value: true });
  assert.deepEqual(schema.parse({ value: "false" }), { value: false });
  assert.deepEqual(schema.parse({}), {});
  assert.throws(() => schema.parse({ value: "0" }));
});
