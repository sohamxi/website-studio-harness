#!/usr/bin/env node
import { main } from "../src/cli.js";

main(process.argv.slice(2)).catch((err) => {
  console.error(`\n✖ website-studio: ${err?.message ?? err}`);
  if (process.env.WEBSITE_STUDIO_DEBUG) console.error(err?.stack);
  process.exit(1);
});
