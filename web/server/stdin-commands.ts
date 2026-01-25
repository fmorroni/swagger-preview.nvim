import { getLogger } from "@logtape/logtape";
import { Errors, exitWithLog } from "./errors.ts";

const logger = getLogger(["server"]);

export enum StdinCommand {
  refreshWindow = "r",
  quit = "q",
}

let activeSocket: WebSocket | null = null;

export async function startStdinLoop(serverShutdown: () => Promise<void>) {
  const decoder = new TextDecoder("utf-8");

  while (true) {
    const buf = new Uint8Array(1);
    const n = await Deno.stdin.read(buf);
    if (n === null) {
      exitWithLog(Errors.ErrorStdinRead, logger);
    } else if (n === 0) {
      logger.info("Idk what it means that 0 bytes where read...");
      continue;
    }

    const cmd = decoder.decode(buf) as StdinCommand;

    if (!activeSocket) {
      logger.info("No WebSocket opened to send: {cmd}");
      continue;
    }

    if (cmd === StdinCommand.quit) {
      logger.info("Stopping server...");
      activeSocket.close(1, "Server shutdown");
      await serverShutdown();
      Deno.exit(0);
    }

    if (activeSocket.readyState === WebSocket.OPEN) {
      logger.info("WebSocket send: {cmd}", { cmd });
      activeSocket.send(cmd);
    }
  }
}

export function initWebSocket(socket: WebSocket) {
  socket.onclose = (event) => {
    if (logger.isEnabledFor("debug")) logger.debug("WebSocket closed: {event}", { event });
    else logger.info("WebSocket closed", { event });
    if (activeSocket === socket) activeSocket = null;
  };

  socket.onopen = () => {
    logger.info("WebSocket opened");
    activeSocket = socket;
  };
}
