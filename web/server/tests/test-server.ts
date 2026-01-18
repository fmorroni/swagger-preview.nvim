import { assertEquals } from "@std/assert";
import { createServerHandler } from "../server.ts";

Deno.test("serves openapi spec", async () => {
  const specPath = new URL("./fixtures/openapi.json", import.meta.url).pathname;

  const handler = createServerHandler({ specPath });

  const req = new Request("http://localhost/openapi");
  const res = await handler(req);

  assertEquals(res.status, 200);

  const body = JSON.parse(await res.text());
  assertEquals(body.openapi, "3.0.1");
});
