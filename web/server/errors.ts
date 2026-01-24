import { Logger } from "@logtape/logtape";

interface ServerError {
  code: number;
  message: string;
}

export const Errors = {
  AppCommandFailure: { code: 1, message: "Failed to run APP" },
  MissingApp: { code: 2, message: "--app not set" },
  MissingSpecRoot: { code: 3, message: "--spec-root not set" },
  MissingSpecMainFile: { code: 4, message: "--spec-main-file not set" },
  ErrorStdinRead: { code: 5, message: "Error reading stdin" },
  UndefinedServerShutdown: { code: 6, message: "Undefined server shutdown" },
} as const satisfies Record<string, ServerError>;

export function exitWithMessage(error: ServerError): never {
  console.error(error.message);
  Deno.exit(error.code);
}

export function exitWithLog(error: ServerError, logger: Logger): never {
  logger.error(error.message);
  Deno.exit(error.code);
}
