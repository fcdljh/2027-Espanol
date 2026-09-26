import { copyFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectDirectory = path.resolve(scriptDirectory, "..");
const source = path.join(projectDirectory, "public", "plan.geo.json");
const destination = path.join(projectDirectory, "site", "plan.geo.json");
const preDepartureSource = path.join(projectDirectory, "public", "pre-departure.json");
const preDepartureDestination = path.join(projectDirectory, "site", "pre-departure.json");

await copyFile(source, destination);
await copyFile(preDepartureSource, preDepartureDestination);
console.log(`Static site data synced: ${path.relative(projectDirectory, destination)}`);
console.log(`Static site data synced: ${path.relative(projectDirectory, preDepartureDestination)}`);
