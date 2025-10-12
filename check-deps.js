import { checkDependencies } from "./src/setup/dependencies.js";

try {
  checkDependencies();
} catch (e) {
  console.error(e.message, `\n`);
  process.exit(1);
}

console.log(`All dependencies have been met.`);
process.exit(0);
