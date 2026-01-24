import { getLogger } from "@logtape/logtape";
import { Errors, exitWithLog } from "./errors.ts";
import { createServerHandler } from "./server.ts";
import { configureLogtape } from "./logtape-config.ts";
import { parseServerArgs } from "./args.ts";

const { app, hostname, logFile, logLevel, specRoot, specMainFile, port } = parseServerArgs();

configureLogtape(logFile, logLevel);

const logger = getLogger(["server"]);

const { handler, setServerShutdown } = createServerHandler({ specRoot, specMainFile, logFile });

const server = Deno.serve({ hostname, port }, handler);
setServerShutdown(server.shutdown);

const [cmd, ...args] = app.split(" ");
args.push(`http://${hostname}:${server.addr.port}/swagger-ui`);
const command = new Deno.Command(cmd, { args });

const { code, stderr } = await command.output();

if (code !== 0) {
  logger.error(new TextDecoder().decode(stderr));
  exitWithLog(Errors.AppCommandFailure, logger);
}

const encoder = new TextEncoder();

Deno.stdout.write(encoder.encode(server.addr.port.toString()));
