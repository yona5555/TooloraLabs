// The server a check, audit, lock or preview script talks to is always given explicitly: no script defaults to
// a port, because port 3001 is xzerone's dev server (CLAUDE.md) and a silent default would load, measure or warm
// it. Start a test server on a dedicated free port (scripts/test-server.sh start 3110 apps/web) and pass its URL.
import { basename } from "node:path";

export function requireBase(value) {
  if (!value) {
    console.error(
      `${basename(process.argv[1])}: no server given. Pass BASE=http://localhost:<port> (or --base <url>) of a server ` +
        "you started on a dedicated free port, e.g. scripts/test-server.sh start 3110 apps/web. There is no default port.",
    );
    process.exit(2);
  }
  return value.replace(/\/+$/, "");
}
