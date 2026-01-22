import { getLogger } from "@logtape/logtape";

const logger = getLogger(["server"]);

interface ServerError {
  code: number;
  message: string;
}

export const Errors = {
  AppCommandFailure: { code: 1, message: "Failed to run APP" },
  MissingApp: { code: 2, message: "--app not set" },
  MissingSpecRoot: { code: 3, message: "--spec-root not set" },
  MissingSpecMainFile: { code: 4, message: "--spec-main-file not set" },
} as const satisfies Record<string, ServerError>;

export function exitWithMessage(error: ServerError): never {
  logger.error(error.message);
  Deno.exit(error.code);
}
