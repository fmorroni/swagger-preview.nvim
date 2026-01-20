import { getLogger } from "@logtape/logtape";
import { serveDir } from "@std/http/file-server";

const logger = getLogger(["server"]);

const SWAGGER_UI_ROOT = new URL("../swagger-ui", import.meta.url).pathname;

export function createServerHandler(opts: {
  specPath: string;
  logFile: string;
}) {
  return async function handler(req: Request): Promise<Response> {
    try {
      logger.debug("Request: {req}", { req });

      const url = new URL(req.url);

      if (url.pathname === "/openapi") {
        const spec = await Deno.open(opts.specPath, { read: true });
        return new Response(spec.readable);
      }

      return await serveDir(req, {
        fsRoot: SWAGGER_UI_ROOT,
        showIndex: true,
        showDirListing: false,
      });
    } catch (err) {
      // TODO: when the errror originates at `serveDir` it doesn't trigger this.
      logger.error("createServerHandler error: {err}", { err });
      return new Response("Internal error, check logs at " + opts.logFile, {
        status: 500,
      });
    }
  };
}
