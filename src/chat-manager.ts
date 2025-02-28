import { WebSocket } from "bun";
import { Message, MessageType, JoinRoomMessage, LeaveRoomMessage, ChatMessage, ErrorMessage, UserListMessage } from "./types";
import { logger } from "./utils/logger";

/**
 * Room data structure containing all related room information
 */
interface RoomData {
    /** Map of WebSocket connections to usernames */
    clients: Map<WebSocket, string>;
    /** Set of all usernames in the room */
    usernames: Set<string>;
}

/**
 * Manages chat rooms, users, and message broadcasting
 */
export class ChatManager {
    /** Map of room IDs to room data */
    private rooms: Map<string, RoomData> = new Map();

    /**
     * Create a new room
     * @param roomId - Unique identifier for the room
     * @returns true if room was created, false if it already exists
     */
    createRoom(roomId: string): boolean {
        if (this.rooms.has(roomId)) {
            logger.info(`Room ${roomId} already exists`);
            return false;
        }

        this.rooms.set(roomId, {
            clients: new Map(),
            usernames: new Set()
        });
        logger.info(`Room ${roomId} created`);
        return true;
    }

    /**
     * Add a user to a room
     * @param ws - WebSocket connection of the user
     * @param roomId - ID of the room to join
     * @param username - Username of the user
     * @returns true if user successfully joined, false otherwise
     */
    joinRoom(ws: WebSocket, roomId: string, username: string): boolean {
        // Create room if it doesn't exist
        if (!this.rooms.has(roomId)) {
            this.createRoom(roomId);
        }

        const roomData = this.rooms.get(roomId)!;

        // Check if username is already in the room
        if (roomData.usernames.has(username)) {
            logger.warn(`Username ${username} already taken in room ${roomId}`);
            return false;
        }

        // Check if this connection is already in the room
        if (roomData.clients.has(ws)) {
            logger.warn(`Connection already in room ${roomId}`);
            return false;
        }

        // Add user to room
        roomData.clients.set(ws, username);
        roomData.usernames.add(username);

        // Notify all users in the room that a new user has joined
        const message: JoinRoomMessage = {
            system: true,
            type: MessageType.JOIN_ROOM,
            roomId: roomId,
            username: username,
            content: `@${username} joined the room`
        };
        this.broadcastMessage(roomId, message);
        
        logger.info(`User ${username} joined room ${roomId}`);
        return true;
    }

    /**
     * Remove a user from a room
     * @param ws - WebSocket connection of the user
     * @param roomId - ID of the room to leave
     * @param username - Username of the user
     * @returns true if user successfully left, false otherwise
     */
    leaveRoom(ws: WebSocket, roomId: string, username: string): boolean {
        const roomData = this.rooms.get(roomId);

        if (!roomData) {
            logger.warn(`Attempted to leave non-existent room ${roomId}`);
            return false;
        }

        roomData.clients.delete(ws);
        roomData.usernames.delete(username);

        // If room is empty, delete it
        if (roomData.clients.size === 0) {
            this.rooms.delete(roomId);
            logger.info(`Room ${roomId} deleted (empty)`);
        } else {
            // Notify remaining users that a user has left
            const message: LeaveRoomMessage = {
                system: true,
                type: MessageType.LEAVE_ROOM,
                roomId: roomId,
                username: username,
                content: `@${username} left the room`
            };
            this.broadcastMessage(roomId, message);
        }

        logger.info(`User ${username} left room ${roomId}`);
        return true;
    }

    /**
     * Broadcast a message to all users in a room
     * @param roomId - ID of the room to broadcast to
     * @param message - Message to broadcast
     */
    broadcastMessage(roomId: string, message: Message): void {
        const roomData = this.rooms.get(roomId);

        if (!roomData) {
            logger.warn(`Attempted to broadcast to non-existent room ${roomId}`);
            return;
        }

        const messageStr = JSON.stringify({
            ...message,
            timestamp: Date.now()
        });
        
        try {
            for (const client of roomData.clients.keys()) {
                client.send(messageStr);
            }
            logger.debug(`Broadcasted message to room ${roomId}`);
        } catch (error) {
            logger.error(`Error broadcasting message: ${error}`);
        }
    }

    /**
     * Send an error message to a client
     * @param ws - WebSocket connection to send the error to
     * @param message - Error message
     */
    sendError(ws: WebSocket, message: ErrorMessage): void {
        try {
            ws.send(JSON.stringify(message));
            logger.debug(`Sent error to user ${message.username}: ${message.content}`);
        } catch (error) {
            logger.error(`Error sending error message: ${error}`);
        }
    }

    /**
     * Handle user disconnect by removing them from all rooms
     * @param ws - WebSocket connection of the disconnected user
     */
    handleDisconnect(ws: WebSocket): void {
        logger.info('User disconnected');
        
        // Find which rooms this user is in and remove them
        this.rooms.forEach((roomData, roomId) => {
            const username = roomData.clients.get(ws);
            if (username) {
                logger.info(`Removing disconnected user ${username} from room ${roomId}`);
                this.leaveRoom(ws, roomId, username);
            }
        });
    }
}
