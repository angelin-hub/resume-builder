import serverless from "serverless-http";
import { createServer } from "../../server";

const app = createServer();

// serverless-http wraps Express — on Netlify the request path arrives as
// /.netlify/functions/api/auth/signin (the /api prefix is stripped by the
// redirect rule). We re-add /api so Express route handlers match correctly.
const handler = serverless(app, {
  request(req: any) {
    // Netlify passes the path AFTER the function name, e.g. /auth/signin
    // We need to prepend /api so Express sees /api/auth/signin
    if (req.url && !req.url.startsWith("/api")) {
      req.url = "/api" + (req.url.startsWith("/") ? req.url : "/" + req.url);
    }
  },
});

export { handler };
