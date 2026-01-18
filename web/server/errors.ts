interface ServerError {
  code: number;
  message: string;
}

export const Errors = {
  MissingSpecPath: { code: 1, message: "SPEC_PATH not set" },
  MissingSocket: { code: 2, message: "HANDSHAKE_SOCKET not set" },
} as const satisfies Record<string, ServerError>;

export function exitWithMessage(error: ServerError): never {
  console.error(error.message);
  Deno.exit(error.code);
}
