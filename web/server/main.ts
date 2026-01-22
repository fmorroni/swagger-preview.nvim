import { getLogger } from "@logtape/logtape";
import { Errors, exitWithMessage } from "./errors.ts";
import { createServerHandler } from "./server.ts";
import { StdinCommand } from "./stdin-commands.ts";
import { configureLogtape } from "./logtape-config.ts";
import { parseServerArgs } from "./args.ts";

const { specPath, port, app, logFile, logLevel } = parseServerArgs();

configureLogtape(logFile, logLevel);

const logger = getLogger(["server"]);

const handler = createServerHandler({ specPath, logFile });

const server = Deno.serve({ hostname: "localhost", port }, handler);

const [cmd, ...args] = app.split(" ");
args.push("http://localhost:" + server.addr.port);
const command = new Deno.Command(cmd, { args });

const { code, stderr } = await command.output();

if (code !== 0) {
  logger.error(new TextDecoder().decode(stderr));
  exitWithMessage(Errors.AppCommandFailure);
}

while (true) {
  const buf = new Uint8Array(1);
  await Deno.stdin.read(buf);
  const cmd = new TextDecoder().decode(buf) as StdinCommand;
  switch (cmd) {
    case StdinCommand.refreshWindow:
      logger.info("Should refresh window");
  }
}
