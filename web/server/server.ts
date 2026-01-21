import { getLogger } from "@logtape/logtape";
import { serveDir, serveFile } from "@std/http/file-server";

const logger = getLogger(["server"]);

const SWAGGER_UI_ROOT = new URL("../swagger-ui", import.meta.url).pathname;

export function createServerHandler(opts: {
  specPath: string;
  logFile: string;
}) {
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

function dispatch(
  req: Request,
  url: URL,
  opts: { specPath: string },
): Promise<Response> {
  if (url.pathname === "/openapi") {
    return serveFile(req, opts.specPath);
  }

  return serveDir(req, {
    fsRoot: SWAGGER_UI_ROOT,
    showIndex: true,
    showDirListing: false,
    quiet: true,
  });
}
