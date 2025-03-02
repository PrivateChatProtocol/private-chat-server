import { Elysia } from 'elysia';
import { ChatManager } from './chat-manager';
import { Message, MessageType, ChatMessage, ErrorMessage } from './types';
import { logger } from './utils/logger';
import { config } from './config';

/**
 * Initialize the chat application
 */
const chatManager = new ChatManager();

const app = new Elysia()
  .ws('/ws', {
    /**
     * Handle new WebSocket connection
     */
    open(ws) {
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
            const success = chatManager.joinRoom(ws, parsedMessage.roomId, parsedMessage.username);
            if (!success) {
              const errorMessage: ErrorMessage = {
                system: true,
                type: MessageType.ERROR,
                roomId: parsedMessage.roomId,
                username: parsedMessage.username,
                content: 'Username already taken',
                timestamp: Date.now(),
              };
              chatManager.sendError(ws, errorMessage);
            }
            break;
            
          case MessageType.LEAVE_ROOM:
            chatManager.leaveRoom(ws, parsedMessage.roomId, parsedMessage.username);
            break;
            
          case MessageType.CHAT_MESSAGE:
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
    close(ws, code, message) {
      logger.info(`Connection closed with code ${code}`);
      chatManager.handleDisconnect(ws);
    },
    
    /**
     * Handle WebSocket error
     */
    error(ws, error) {
      logger.error('WebSocket error:', error);
    }
  })
  // Health check endpoint
  .get('/health', () => ({ status: 'ok' }))
  .listen(config.port);

console.log(
  `🔒 Private Chat backend is running at ${app.server?.hostname}:${app.server?.port}`
);
