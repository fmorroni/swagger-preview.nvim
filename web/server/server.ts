import { getLogger } from "@logtape/logtape";
import { serveDir, serveFile as denoServeFile, ServeFileOptions } from "@std/http/file-server";
import { initWebSocket } from "./stdin-commands.ts";
import { Errors, exitWithLog } from "./errors.ts";

const logger = getLogger(["server"]);

const SWAGGER_UI_ROOT = new URL("../swagger-ui", import.meta.url).pathname;

interface CreateServerHandlerReturn {
  handler: Deno.ServeHandler;
  setServerShutdown: (fn: () => Promise<void>) => void;
}

export function createServerHandler(opts: {
  specRoot: string;
  specMainFile: string;
  logFile: string;
}): CreateServerHandlerReturn {
  let serverShutdown: (() => Promise<void>) | undefined;

  function setServerShutdown(fn: () => Promise<void>) {
    serverShutdown = fn;
  }

  const handler = async (req: Request): Promise<Response> => {
    if (!serverShutdown) exitWithLog(Errors.UndefinedServerShutdown, logger);

    logger.debug("Request: {req}", { req });

    const url = new URL(req.url);
    const res = await dispatch(req, url, serverShutdown, opts);

    logger.debug("Response: {res}", { res });

    return res;
  };

  return { handler, setServerShutdown };
}

async function dispatch(
  req: Request,
  url: URL,
  serverShutdown: () => Promise<void>,
  opts: { specRoot: string; specMainFile: string }
): Promise<Response> {
  if (req.headers.get("upgrade") === "websocket") {
    const { socket, response } = Deno.upgradeWebSocket(req);
    initWebSocket(socket, serverShutdown);
    return response;
  }

  if (url.pathname === "/openapi") {
    return await serveFile(req, `${opts.specRoot}/${opts.specMainFile}`, {
      headers: { "Cache-Control": "no-cache" },
    });
  }

  if (url.pathname.startsWith("/swagger-ui")) {
    return await serveDir(req, {
      fsRoot: SWAGGER_UI_ROOT,
      urlRoot: "swagger-ui",
      showIndex: true,
      showDirListing: false,
      quiet: true,
    });
  }

  const res = await serveFile(req, `${opts.specRoot}/${url.pathname}`, {
    headers: { "Cache-Control": "no-cache" },
  });
  return res;
}

async function serveFile(
  req: Request,
  filePath: string,
  options?: ServeFileOptions & { headers: Record<string, string> }
): Promise<Response> {
  const res = await denoServeFile(req, filePath, options);
  for (const name in options?.headers) {
    res.headers.set(name, options.headers[name]);
  }
  return res;
}
