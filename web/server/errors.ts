import { getLogger } from "@logtape/logtape";

const logger = getLogger(["server"]);

interface ServerError {
  code: number;
  message: string;
}

export const Errors = {
  MissingSpecRoot: { code: 1, message: "--spec-root not set" },
  MissingSpecMainFile: { code: 1, message: "--spec-main-file not set" },
  MissingApp: { code: 2, message: "APP not set" },
  AppCommandFailure: { code: 3, message: "Failed to run APP" },
} as const satisfies Record<string, ServerError>;

export function exitWithMessage(error: ServerError): never {
  logger.error(error.message);
  Deno.exit(error.code);
}
