#!/usr/bin/env bash
# Starts or stops a `next start` test server on a dedicated port, never touching a process it did not start.
#   scripts/test-server.sh start <port> <app dir> <path>...  fails at once if the port is taken; else starts the
#       server, records its PID in .test-server-<port>.pid, waits until it answers (at most 60s) and then
#       requests every <path> once (ready check + warm-up: any non-2xx fails the step).
#   scripts/test-server.sh stop <port>                       stops only the PID recorded by `start`.
# Never kills by port: an occupied port is an error to report, not a process to remove.
set -euo pipefail
cmd=$1 port=$2
pidfile="$PWD/.test-server-$port.pid"
in_use() { (exec 3<>"/dev/tcp/127.0.0.1/$port") 2>/dev/null; }

case "$cmd" in
  start)
    dir=$3; shift 3
    if in_use; then
      echo "::error::Port $port is already in use by another process; the test server needs a free port. Nothing was stopped."
      exit 1
    fi
    next_bin=$(cd "$dir" && node -p "require.resolve('next/dist/bin/next')")
    (cd "$dir" && exec node "$next_bin" start -p "$port" > "/tmp/next-$port.log" 2>&1) &
    echo $! > "$pidfile"
    for _ in $(seq 1 60); do curl -sf -o /dev/null "http://localhost:$port/en" && break; sleep 1; done
    for path in /en "$@"; do curl -sf -o /dev/null "http://localhost:$port$path"; done
    echo "Test server ready on :$port (PID $(cat "$pidfile")), warmed: /en $*"
    ;;
  stop)
    [ -f "$pidfile" ] || { echo "No test server recorded for port $port."; exit 0; }
    pid=$(cat "$pidfile")
    # The recorded PID is the server itself (the subshell exec'd node), so this stops exactly that process.
    kill -TERM "$pid" 2>/dev/null || true
    # Gone before the next step measures or binds: at most 5s, then the step reports a taken port itself.
    for _ in $(seq 1 50); do kill -0 "$pid" 2>/dev/null || break; sleep 0.1; done
    rm -f "$pidfile"
    echo "Stopped the test server started on :$port (PID $pid)."
    ;;
  *) echo "Usage: $0 start <port> <app dir> [path...] | stop <port>" >&2; exit 2 ;;
esac
