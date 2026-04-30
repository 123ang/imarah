import { mkdirSync } from "node:fs";
import { createApp } from "./app.js";
import { config } from "./config.js";

mkdirSync(config.uploadRoot, { recursive: true });

const app = createApp();
app.listen(config.port, () => {
  console.log(`IMARAH API http://127.0.0.1:${config.port}`);
});
