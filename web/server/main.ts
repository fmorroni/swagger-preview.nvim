import { getFileSink } from "@logtape/file";
import { configure, getConsoleSink, getLogger } from "@logtape/logtape";
import { parseArgs, ParseArgsOptionsConfig } from "node:util";
import { Errors, exitWithMessage } from "./errors.ts";
import { createServerHandler } from "./server.ts";
import { StdinCommand } from "./stdin-commands.ts";

type LogLevel = "info" | "trace" | "debug" | "warning" | "error" | "fatal"

const options: ParseArgsOptionsConfig = {
  "spec-path": {
    type: "string",
    short: "s",
  },
  port: {
    type: "string",
    short: "p",
  },
  app: {
    type: "string",
    short: "a",
  },
  "log-file": { type: "string" },
  "log-level": { type: "string" },
};
const { values } = parseArgs({ args: Deno.args, options });

if (!values["spec-path"]) exitWithMessage(Errors.MissingSpecPath);
const specPath = values["spec-path"] as string;
if (!values.port) values.port = "0";
const port = Number(values.port as string);
if (!values.app) exitWithMessage(Errors.MissingApp);
const app = values.app as string;
if (!values["log-file"]) values["log-file"] = "swagger-preview.log";
const logFile = values["log-file"] as string;
if (!values["log-level"]) values["log-level"] = "info";
const logLevel = values["log-file"] as LogLevel

await configure({
  sinks: { console: getConsoleSink(), file: getFileSink(logFile) },
  loggers: [
    { category: "server", lowestLevel: logLevel, sinks: ["console", "file"] },
  ],
});

const logger = getLogger(["server"]);

const handler = createServerHandler({ specPath, logFile });

const server = Deno.serve({ hostname: "localhost", port }, handler);

const [cmd, ...args] = app.split(" ");
args.push("http://localhost:" + server.addr.port);
const command = new Deno.Command(cmd, { args });

const { code, stderr } = await command.output();

if (code !== 0) {
  logger.error(new TextDecoder().decode(stderr));
  exitWithMessage(Errors.AppCommandFailure);
}

while (true) {
  const buf = new Uint8Array(1);
  await Deno.stdin.read(buf);
  const cmd = new TextDecoder().decode(buf) as StdinCommand;
  switch (cmd) {
    case StdinCommand.refreshWindow:
      logger.debug("Should refresh window");
  }
}
