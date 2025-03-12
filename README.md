# Private Chat Server

A secure, ephemeral chat application with no history, logs, tracking, or authentication.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Bun](https://img.shields.io/badge/Bun-1.0%2B-black)](https://bun.sh)
[![Elysia](https://img.shields.io/badge/Elysia-latest-purple)](https://elysiajs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-blue)](https://www.typescriptlang.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)
[![Docker](https://img.shields.io/badge/Docker-ready-blue)](https://www.docker.com/)
[![Maintenance](https://img.shields.io/badge/Maintained-yes-green.svg)](https://github.com/PrivateChatProtocol/private-chat-server/graphs/commit-activity)
[![Privacy First](https://img.shields.io/badge/Privacy-First-darkgreen)](https://en.wikipedia.org/wiki/Privacy_by_design)
[![No Tracking](https://img.shields.io/badge/No-Tracking-red)](https://en.wikipedia.org/wiki/Internet_privacy)
[![Zero Knowledge](https://img.shields.io/badge/Zero-Knowledge-purple)](https://en.wikipedia.org/wiki/Zero-knowledge_proof)

This server works standalone. You can use this frontend client [here](https://github.com/PrivateChatProtocol/private-chat-ui) or build your own.

## Features

- Real-time messaging using secure WebSockets
- Private chat rooms with access control
- Zero storage of message content on server
- Containerized deployment with Docker
- Built with TypeScript for type safety

## Privacy Highlights

- **No Message Storage**: Messages are not stored on the server, only relayed between authorized participants
- **No Logs**: All logs are disabled in production mode
- **No Third-Party Services**: Operates independently without external service dependencies
- **Encrypted Trnamission**: All messages are encrypted in transit using secure WebSockets
- **Open Source**: Full transparency about how your data is handled

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) 1.0.0 or higher
- For production: Docker and Docker Compose (optional but recommended)

### Development

1. Clone the repository

2. Install dependencies

```bash
bun install
```

3. Start the server

```bash
bun run dev
```

4. Access the server at `http://localhost:8000`

### Production

1. Build the Docker image

```bash
docker build -t private-chat-server .
```

2. Start the server

```bash
docker run -p 8000:8000 private-chat-server
```

or, using Docker Compose

```bash
docker-compose up
```

### Environment

The server can be configured using environment variables. Create a `.env` file in the project root with the following variables:

```env
# Server configuration
PORT=8000

# Environment (development or production)
NODE_ENV=production

# Logging level (all, debug, info, warn, error). Logs are disabled in production.
LOG_LEVEL=error
```
