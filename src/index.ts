import { Elysia } from 'elysia';
import { ChatManager } from './chat-manager';
import { Message, MessageType, ErrorMessage, JoinRoomMessage, LeaveRoomMessage } from './types';
import { logger } from './utils/logger';
import { config } from './config';
import { renderIndexPage } from './templates/index.html';

const VERSION = require('../package.json').version;

/**
 * Determines if the user agent is a browser
 */
function isBrowser(userAgent: string | null): boolean {
  if (!userAgent) return false;
  
  // Common browser identifiers
  const browserIdentifiers = [
    'Mozilla', 'Chrome', 'Safari', 'Firefox', 'Edge', 'Opera', 
    'Edg', 'MSIE', 'Trident', 'Chromium'
  ];
  
  return browserIdentifiers.some(identifier => userAgent.includes(identifier));
}

/**
 * Initialize the chat application
 */
const chatManager = new ChatManager();
const args = Bun.argv.slice(2);
const portFlagIndex = args.indexOf("--port");
const port = (config.isDevelopment && portFlagIndex !== -1) ? args[portFlagIndex + 1] : config.port;
const app = new Elysia()
  .ws('/ws', {
    maxPayloadLength: config.maxPayloadBytes,
    /**
     * Handle new WebSocket connection
     */
    open(_ws) {
      logger.info('New connection opened');
    },
    
    /**
     * Handle WebSocket message
     */
    message(ws, message) {
      try {
        const parsedMessage = message as Message;

        logger.debug('Received message:', parsedMessage);
        
        switch (parsedMessage.type) {
          case MessageType.JOIN_ROOM:
            
              const joinRoomMessage = parsedMessage as JoinRoomMessage;
              const joinError = chatManager.joinRoom(ws, joinRoomMessage.roomId, joinRoomMessage.username);
              if (joinError) {
                chatManager.sendError(ws, {
                  system: true,
                  type: MessageType.ERROR,
                  roomId: joinRoomMessage.roomId,
                  username: joinRoomMessage.username,
                  content: joinError,
                  timestamp: Date.now(),
                });
              }
            break;
            
          case MessageType.LEAVE_ROOM:
            const leaveRoomMessage = parsedMessage as LeaveRoomMessage;
            chatManager.leaveRoom(ws, leaveRoomMessage.roomId, leaveRoomMessage.username);
            break;
            
          case MessageType.CHAT_MESSAGE:
          case MessageType.IMAGE_MESSAGE:
            if (!chatManager.isInRoom(ws, parsedMessage.roomId)) {
              chatManager.sendError(ws, {
                system: true,
                type: MessageType.ERROR,
                roomId: parsedMessage.roomId,
                content: 'Not a member of this room',
                timestamp: Date.now(),
              });
              break;
            }
            chatManager.broadcastMessage(parsedMessage.roomId, parsedMessage);
            break;
            
          default:
            logger.warn(`Unknown message type: ${parsedMessage.type}`);
            break;
        }
      } catch (error) {
        logger.error('Error processing message:', error);
        const errorMessage: ErrorMessage = {
          system: true,
          type: MessageType.ERROR,
          roomId: '',
          content: 'Invalid message format',
          timestamp: Date.now(),
        };
        chatManager.sendError(ws, errorMessage);
      }
    },
    
    /**
     * Handle WebSocket close
     */
    close(ws, code, _message) {
      logger.info(`Connection closed with code ${code}`);
      chatManager.handleDisconnect(ws);
    },
    
    /**
     * Handle WebSocket error
     */
    error(...args: any[]):void {
      const error = args[1];
      logger.error('WebSocket error:', error);
    }
  })
  // Health check endpoint
  .get('/health', () => ({ status: 'ok' }))
  .get('/', ({ request }) => {
    const userAgent = request.headers.get('User-Agent');
    
    if (isBrowser(userAgent)) {
      // Return HTML content for browsers
      return new Response(renderIndexPage(VERSION, port), {
        headers: {
          'Content-Type': 'text/html'
        }
      });
    } else {
      // Return JSON for non-browser clients (like curl)
      return Response.json({
        protocol: "Private Chat Protocol",
        version: VERSION,
        status: "running",
        port: port,
        about: "https://privatechat.network/about"
      });
    }
  })
  .listen(port);

console.log(
  `🔒 Private Chat Server\nVersion: v${VERSION}\nListening at ${app.server?.hostname}:${app.server?.port}`
);
