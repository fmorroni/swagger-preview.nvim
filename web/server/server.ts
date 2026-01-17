import { serveDir } from "@std/http/file-server";

const SWAGGER_UI_ROOT = new URL("../swagger-ui", import.meta.url).pathname;

export function createServerHandler(opts: {
  specPath: string;
  port?: number;
  handshakeSocket?: string;
}) {
  return async function handler(req: Request): Promise<Response> {
    const url = new URL(req.url);

    if (url.pathname === "/openapi") {
      const spec = await Deno.open(opts.specPath, { read: true });
      return new Response(spec.readable);
    }

    return serveDir(req, {
      fsRoot: SWAGGER_UI_ROOT,
      showIndex: true,
      showDirListing: false,
    });
  };
}

export async function sendPort(socketPath: string, port: number) {
  const conn = await Deno.connect({ path: socketPath, transport: "unix" });
  await conn.write(new TextEncoder().encode(port.toString()));
  conn.close();
}

// const server = Deno.serve({ port: PORT, hostname: "localhost" }, handler);
//
// const port = server.addr.port;
//
// const conn = await Deno.connect({ path: SOCKET, transport: "unix" });
//
// const payload = JSON.stringify({ port });
// await conn.write(new TextEncoder().encode(payload));
//
// conn.close();
