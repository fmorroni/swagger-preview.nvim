interface ServerError {
  code: number;
  message: string;
}

export const Errors = {
  MissingSpecPath: { code: 1, message: "SPEC_PATH not set" },
  MissingApp: { code: 2, message: "APP not set" },
  AppCommandFailure: { code: 3, message: "Failed to run APP" },
} as const satisfies Record<string, ServerError>;

export function exitWithMessage(error: ServerError): never {
  console.error(error.message);
  Deno.exit(error.code);
}
