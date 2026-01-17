import { assertEquals, assertGreater } from "@std/assert";
import { createServerHandler, sendPort } from "../server.ts";

Deno.test("serves openapi spec", async () => {
  const specPath = new URL("./fixtures/openapi.json", import.meta.url).pathname;

  const handler = createServerHandler({ specPath });

  const req = new Request("http://localhost/openapi");
  const res = await handler(req);

  assertEquals(res.status, 200);

  const body = JSON.parse(await res.text());
  assertEquals(body.openapi, "3.0.1");
});

Deno.test("sends port over unix socket", async () => {
  const socketPath = "/tmp/" + Math.random().toString(36);

  const listener = Deno.listen({ path: socketPath, transport: "unix" });
  const port = 12345;

  sendPort(socketPath, port);

  const conn = await listener.accept();
  const buf = new Uint8Array(64);
  const msgLen = (await conn.read(buf)) ?? 0;

  assertGreater(msgLen, 0);

  const msg = new TextDecoder().decode(buf.subarray(0, msgLen));
  assertEquals(parseInt(msg), port);

  conn.close();
  listener.close();
  Deno.removeSync(socketPath);
});
