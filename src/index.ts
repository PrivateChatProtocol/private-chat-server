import { Elysia } from 'elysia';
import { ChatManager } from './chat-manager';
import { Message, MessageType, ErrorMessage, JoinRoomMessage, LeaveRoomMessage } from './types';
import { logger } from './utils/logger';
import { config } from './config';

/**
 * Initialize the chat application
 */
const chatManager = new ChatManager();
const port = (config.isDevelopment && Bun.argv.slice(2).includes("--port")) ? Bun.argv.slice(2)[1] : config.port ;
const app = new Elysia()
  .ws('/ws', {
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
              const success = chatManager.joinRoom(ws, joinRoomMessage.roomId, joinRoomMessage.username);
              if (!success) {
                const errorMessage: ErrorMessage = {
                  system: true,
                  type: MessageType.ERROR,
                  roomId: joinRoomMessage.roomId,
                  username: joinRoomMessage.username,
                  content: 'Username already taken',
                  timestamp: Date.now(),
                };
                chatManager.sendError(ws, errorMessage);
                }
            break;
            
          case MessageType.LEAVE_ROOM:
            const leaveRoomMessage = parsedMessage as LeaveRoomMessage;
            chatManager.leaveRoom(ws, leaveRoomMessage.roomId, leaveRoomMessage.username);
            break;
            
          case MessageType.CHAT_MESSAGE:
            chatManager.broadcastMessage(parsedMessage.roomId, parsedMessage);
            break;
          
          case MessageType.IMAGE_MESSAGE:
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
          username: '',
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
  .listen(port);

console.log(
  `🔒 Private Chat backend is running at ${app.server?.hostname}:${app.server?.port}`
);
