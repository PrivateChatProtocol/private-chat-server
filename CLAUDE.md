# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun install          # Install dependencies
bun run dev          # Start dev server with hot reload (watches src/index.ts)
bun test             # Run unit tests
```

**Docker:**
```bash
docker-compose up    # Run production server on port 8000
```

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `8000` | Server port |
| `NODE_ENV` | (dev if unset) | Set to `production` to disable all logging |
| `LOG_LEVEL` | `all` | One of: `all`, `debug`, `info`, `warn`, `error` |
| `MAX_PAYLOAD_SIZE_MB` | `10` | Maximum WebSocket message size in MB |

## Architecture

Single-file entry point at `src/index.ts` bootstraps an **Elysia** (Bun-native) HTTP/WebSocket server. All real-time communication happens over the `/ws` WebSocket endpoint.

**Data flow:**
1. Client connects via WebSocket at `/ws`
2. Client sends JSON messages typed by `MessageType` enum (`src/types.ts`)
3. `index.ts` dispatches on `message.type` to `ChatManager` methods
4. `ChatManager` (`src/chat-manager.ts`) manages in-memory room state and broadcasts back to all room members

**Key design decisions:**
- **Zero persistence**: All state lives in `ChatManager.rooms` (a `Map<string, RoomData>`). Rooms are created on first join and deleted when empty. No database, no disk writes.
- **No authentication**: Username uniqueness is enforced per-room only; duplicate usernames in the same room are rejected.
- **Logging suppressed in production**: `Logger` (`src/utils/logger.ts`) silently drops all log calls when `NODE_ENV=production`.

**Source layout:**
- `src/index.ts` — Elysia app, WebSocket handlers, HTTP routes (`/`, `/health`)
- `src/chat-manager.ts` — `ChatManager` class: `joinRoom`, `leaveRoom`, `isInRoom`, `broadcastMessage`, `sendError`, `handleDisconnect`
- `src/types.ts` — All message interfaces and `MessageType` enum
- `src/config.ts` — Reads env vars into a typed `config` object
- `src/utils/logger.ts` — Leveled logger, no-ops in production
- `src/templates/index.html.ts` — HTML landing page rendered for browser visits to `/`

**WebSocket message types** (all exchanged as JSON):
- `JOIN_ROOM` / `LEAVE_ROOM` — client-initiated room membership
- `CHAT_MESSAGE` / `IMAGE_MESSAGE` — relayed to all room members (images as base64)
- `USER_LIST` — server-broadcast after membership changes
- `ERROR` — server-sent to individual client on failure
