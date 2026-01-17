import { Errors, exitWithMessage } from "./errors.ts";
import { createServerHandler, sendPort } from "./server.ts";

const SPEC_PATH = Deno.env.get("OPENAPI_SPEC")!;
if (!SPEC_PATH) exitWithMessage(Errors.MissingSocket);
const PORT = Number(Deno.env.get("PORT") ?? 0);
const SOCKET = Deno.env.get("HANDSHAKE_SOCKET")!;
if (!SOCKET) exitWithMessage(Errors.MissingSpecPath);

const handler = createServerHandler({ specPath: SPEC_PATH });

const server = Deno.serve({ hostname: "localhost", port: PORT }, handler);

sendPort(SOCKET, server.addr.port);
