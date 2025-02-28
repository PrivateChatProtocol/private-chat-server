# Private Chat Backend

A secure, real-time WebSocket-based private chat server built with [Elysia](https://elysiajs.com/) and [Bun](https://bun.sh/), designed with privacy as a core principle.

## Features

- End-to-end encryption for all messages
- Real-time messaging using secure WebSockets
- Private chat rooms with access control
- Zero storage of message content on server
- User presence management with privacy controls
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
docker build -t private-chat-backend .
```

2. Start the server

```bash
docker run -p 8000:8000 private-chat-backend
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
