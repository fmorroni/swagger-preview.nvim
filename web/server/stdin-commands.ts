import { getLogger } from "@logtape/logtape";
import { Errors, exitWithLog } from "./errors.ts";

const logger = getLogger(["server"]);

export enum StdinCommand {
  refreshWindow = "r",
  quit = "q",
}

export function initWebSocket(socket: WebSocket) {
  socket.addEventListener("close", () => {
    logger.info("WebSocket closed");
  });

  socket.addEventListener("open", async () => {
    const decoder = new TextDecoder("utf-8");
    while (socket.readyState === WebSocket.OPEN) {
      const buf = new Uint8Array(1);
      const n = await Deno.stdin.read(buf);
      if (n === null) {
        exitWithLog(Errors.ErrorStdinRead, logger);
      } else if (n === 0) {
        logger.info("Idk what it means that 0 bytes where read...");
        continue;
      }
      const cmd = decoder.decode(buf) as StdinCommand;
      logger.info("WebSocket send: {cmd}", { cmd });
      if (cmd === StdinCommand.quit) {
        logger.info("Stopping server...");
        socket.close();
        Deno.exit(0);
      } else {
        socket.send(cmd);
      }
    }
  });
}
