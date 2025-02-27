import { Elysia } from 'elysia';
import { ChatManager } from './chat-manager';
import { Message, MessageType, ChatMessage } from './types';

const chatManager = new ChatManager();

const app = new Elysia()
  .ws('/ws', {
    open(ws) {
      console.log('Connection opened');
    },
    message(ws, message) {
      try {
        const parsedMessage = message as Message;

        // We only log messages in development mode
        if (process.env.NODE_ENV !== 'production') {
          console.log('Received message:', parsedMessage);
        }
        
        switch (parsedMessage.type) {
          case MessageType.JOIN_ROOM:
            const success = chatManager.joinRoom(ws, parsedMessage.roomId, parsedMessage.username)
            if (!success) {
              chatManager.sendError(ws, 'Failed to join room');
            }
            break;
            
          case MessageType.LEAVE_ROOM:
            chatManager.leaveRoom(ws, parsedMessage.roomId, parsedMessage.username)
            break;
            
          case MessageType.CHAT_MESSAGE:
            chatManager.broadcastMessage(parsedMessage.roomId, parsedMessage);
            break;
            
          default:
            // chatManager.sendError(ws, 'Unknown message type');
            break;
        }
      } catch (error) {
        console.error('Error processing message:', error);
        chatManager.sendError(ws, 'Invalid message format');
      }
    },
    close(ws) {
      console.log('Connection closed');
      chatManager.handleDisconnect(ws);
    }
  })
  .listen(8000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
