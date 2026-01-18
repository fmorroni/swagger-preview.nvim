import { Errors, exitWithMessage } from "./errors.ts";
import { createServerHandler } from "./server.ts";

const SPEC_PATH = Deno.env.get("OPENAPI_SPEC");
if (!SPEC_PATH) exitWithMessage(Errors.MissingApp);
const PORT = Number(Deno.env.get("PORT") ?? 0);
const APP = Deno.env.get("APP");
if (!APP) exitWithMessage(Errors.MissingApp);

const handler = createServerHandler({ specPath: SPEC_PATH });

const server = Deno.serve({ hostname: "localhost", port: PORT }, handler);

const app = JSON.parse(APP);
const cmd = app.slice(0, 1)[0];
const args = app.slice(1);
args.push("http://localhost:" + server.addr.port);
const command = new Deno.Command(cmd, { args });

const { code, stderr } = await command.output();

if (code !== 0) {
  // TODO: replace with file logging
  console.log("stderr: ", new TextDecoder().decode(stderr));
  exitWithMessage(Errors.AppCommandFailure);
}
