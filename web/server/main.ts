import { getLogger } from "@logtape/logtape";
import { Errors, exitWithMessage } from "./errors.ts";
import { createServerHandler } from "./server.ts";
import { StdinCommand } from "./stdin-commands.ts";
import { configureLogtape } from "./logtape-config.ts";
import { parseServerArgs } from "./args.ts";

const { app, hostname, logFile, logLevel, specRoot, specMainFile, port } = parseServerArgs();

configureLogtape(logFile, logLevel);

const logger = getLogger(["server"]);

const handler = createServerHandler({ specRoot, specMainFile, logFile });

const server = Deno.serve({ hostname, port }, handler);

const [cmd, ...args] = app.split(" ");
args.push(`http://${hostname}:${server.addr.port}/swagger-ui`);
const command = new Deno.Command(cmd, { args });

const { code, stderr } = await command.output();

if (code !== 0) {
  logger.error(new TextDecoder().decode(stderr));
  exitWithMessage(Errors.AppCommandFailure);
}

const decoder = new TextDecoder("utf-8");
const encoder = new TextEncoder();

Deno.stdout.write(encoder.encode(server.addr.port.toString()));

while (true) {
  const buf = new Uint8Array(1);
  await Deno.stdin.read(buf);
  const cmd = decoder.decode(buf) as StdinCommand;
  switch (cmd) {
    case StdinCommand.refreshWindow:
      logger.info("Should refresh window");
  }
}
