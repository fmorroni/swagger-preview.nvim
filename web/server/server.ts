import { getLogger } from "@logtape/logtape";
import { serveDir, serveFile } from "@std/http/file-server";
import { initWebSocket } from "./stdin-commands.ts";

const logger = getLogger(["server"]);

const SWAGGER_UI_ROOT = new URL("../swagger-ui", import.meta.url).pathname;

export function createServerHandler(opts: { specRoot: string; specMainFile: string; logFile: string }) {
  return async function handler(req: Request): Promise<Response> {
    logger.debug("Request: {req}", { req });

    const url = new URL(req.url);
    try {
      const res = await dispatch(req, url, opts);
      logger.debug("Response: {res}", { res });
      return res;
    } catch (err) {
      // TODO: when the errror originates at `serveDir` it doesn't trigger this.
      logger.error("createServerHandler error: {err}", { err });
      return new Response("Internal error, check logs at " + opts.logFile, {
        status: 500,
      });
    }
  };
}

async function dispatch(req: Request, url: URL, opts: { specRoot: string; specMainFile: string }): Promise<Response> {
  if (req.headers.get("upgrade") === "websocket") {
    const { socket, response } = Deno.upgradeWebSocket(req);
    initWebSocket(socket);
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
