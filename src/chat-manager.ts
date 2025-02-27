import { WebSocket } from "bun";
import { Message, MessageType, JoinRoomMessage, LeaveRoomMessage, ChatMessage, ErrorMessage, UserListMessage } from "./types";

// Define room data structure that contains all related information
interface RoomData {
    clients: Map<WebSocket, string>; // WebSocket to username mapping
    usernames: Set<string>;          // Set of all usernames in the room
}

export class ChatManager {
    private rooms: Map<string, RoomData> = new Map();

    // Create a new room
    createRoom(roomId: string): boolean {
        if (this.rooms.has(roomId)) {
            return false;
        }

        this.rooms.set(roomId, {
            clients: new Map(),
            usernames: new Set()
        });
        return true;
    }

    // Add user to a room
    joinRoom(ws: WebSocket, roomId: string, username: string): boolean {
        // Create room if it doesn't exist
        if (!this.rooms.has(roomId)) {
            this.createRoom(roomId);
        }

        const roomData = this.rooms.get(roomId)!;

        // Check if username is already in the room
        if (roomData.usernames.has(username)) {
            return false;
        }

        // Check if this connection is already in the room
        if (roomData.clients.has(ws)) {
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

        console.log('User joined room:', roomId, '- username:', username);

        return true;
    }

    // Remove user from a room
    leaveRoom(ws: WebSocket, roomId: string, username: string): boolean {
        const roomData = this.rooms.get(roomId);

        if (!roomData) {
            return false;
        }

        roomData.clients.delete(ws);
        roomData.usernames.delete(username);

        // If room is empty, delete it
        if (roomData.clients.size === 0) {
            this.rooms.delete(roomId);
            console.log('Room deleted:', roomId);
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

        return true;
    }

    // Broadcast a message to all users in a room
    broadcastMessage(roomId: string, message: Message): void {
        const roomData = this.rooms.get(roomId);

        if (!roomData) {
            return;
        }

        const messageStr = JSON.stringify({
            ...message,
            timestamp: Date.now()
        });
        
        for (const client of roomData.clients.keys()) {
            client.send(messageStr);
        }
    }

    // Broadcast the list of users in a room
    broadcastUserList(roomId: string): void {
        const roomData = this.rooms.get(roomId);

        if (!roomData) {
            return;
        }

        const message: UserListMessage = {
            system: true,
            type: MessageType.USER_LIST,
            roomId,
            users: Array.from(roomData.usernames)
        };

        this.broadcastMessage(roomId, message);
    }

    // Send an error message to a client
    sendError(ws: WebSocket, message: ErrorMessage): void {
        console.log('Sending error message:', message);
        ws.send(JSON.stringify(message));
    }

    // Handle user disconnect
    handleDisconnect(ws: WebSocket): void {
        console.log('Disconnecting user...');
        
        // Find which rooms this user is in and remove them
        this.rooms.forEach((roomData, roomId) => {
            const username = roomData.clients.get(ws);
            if (username) {
                console.log('Found user in room:', roomId, '- username:', username);
                this.leaveRoom(ws, roomId, username);
            }
        });
    }
}
