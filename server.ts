import http from "node:http";
import { parse } from "node:url";
import next from "next";
import { attachSocketServer } from "@/lib/socket/server";

const dev = process.env.NODE_ENV !== "production";
const hostname = "0.0.0.0";
const port = Number(process.env.PORT || 3000);

async function bootstrap() {
  const app = next({ dev, hostname, port });
  const handle = app.getRequestHandler();

  await app.prepare();

  const server = http.createServer((request, response) => {
    const parsedUrl = parse(request.url || "", true);
    handle(request, response, parsedUrl);
  });

  attachSocketServer(server);

  server.listen(port, hostname, () => {
    console.log(`> Word Rush Party ready on http://localhost:${port}`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
