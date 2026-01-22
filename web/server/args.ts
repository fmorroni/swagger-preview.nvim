import { parseArgs, ParseArgsOptionsConfig } from "node:util";
import { Errors, exitWithMessage } from "./errors.ts";
import { LogLevel } from "@logtape/logtape";

const options: ParseArgsOptionsConfig = {
  "spec-root": {
    type: "string",
    short: "s",
  },
  "spec-main-file": {
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

export interface Args {
  specRoot: string;
  specMainFile: string;
  port: number;
  app: string;
  logFile: string;
  logLevel: LogLevel;
}

export function parseServerArgs(): Args {
  const { values } = parseArgs({ args: Deno.args, options });

  if (!values["spec-root"]) exitWithMessage(Errors.MissingSpecRoot);
  if (!values["spec-main-file"]) exitWithMessage(Errors.MissingSpecMainFile);
  if (!values.port) values.port = "0";
  if (!values.app) exitWithMessage(Errors.MissingApp);
  if (!values["log-file"]) values["log-file"] = "swagger-preview.log";
  if (!values["log-level"]) values["log-level"] = "info";

  return {
    specRoot: values["spec-root"] as string,
    specMainFile: values["spec-main-file"] as string,
    port: Number(values.port as string),
    app: values.app as string,
    logFile: values["log-file"] as string,
    logLevel: values["log-level"] as LogLevel,
  };
}
