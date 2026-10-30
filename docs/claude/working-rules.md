# Working rules

- After any change to a tool's top interface, run npm run previews for that tool (or all tools) and commit the new images in the same commit. (`npm run previews --workspace=apps/web -- <slug>`; needs BASE=<url> of a prod server you started on a free port, e.g. `scripts/test-server.sh start 3110 apps/web`; there is no default port.)
