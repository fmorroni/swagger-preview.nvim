import { parseArgs, ParseArgsOptionsConfig } from "node:util";
import { Errors, exitWithMessage } from "./errors.ts";
import { LogLevel } from "@logtape/logtape";

const options: ParseArgsOptionsConfig = {
  app: {
    type: "string",
    short: "a",
  },
  hostname: { type: "string" },
  "log-file": { type: "string" },
  "log-level": { type: "string" },
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
};

export interface Args {
  app: string;
  hostname: string;
  logFile: string;
  logLevel: LogLevel;
  specRoot: string;
  specMainFile: string;
  port: number;
}

export function parseServerArgs(): Args {
  const { values } = parseArgs({ args: Deno.args, options });

  // BUG: logger isn't set yet when parsing arguments so the logger in `exitWithMessage`
  // doesn't work!!!
  if (!values.app) exitWithMessage(Errors.MissingApp);
  if (!values.hostname) values.hostname = "localhost";
  if (!values["log-file"]) values["log-file"] = "swagger-preview.log";
  if (!values["log-level"]) values["log-level"] = "info";
  if (!values["spec-root"]) exitWithMessage(Errors.MissingSpecRoot);
  if (!values["spec-main-file"]) exitWithMessage(Errors.MissingSpecMainFile);
  if (!values.port) values.port = "0";

  return {
    app: values.app as string,
    hostname: values.hostname as string,
    logFile: values["log-file"] as string,
    logLevel: values["log-level"] as LogLevel,
    specRoot: values["spec-root"] as string,
    specMainFile: values["spec-main-file"] as string,
    port: Number(values.port as string),
  };
}
