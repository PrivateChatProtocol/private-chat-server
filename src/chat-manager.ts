import { WebSocket } from "bun";
import { Message, MessageType, JoinRoomMessage, LeaveRoomMessage, ChatMessage, ErrorMessage, UserListMessage } from "./types";

export class ChatManager {
    private rooms: Map<string, Set<WebSocket>> = new Map();
    private userSocketMap: Map<WebSocket, string> = new Map();

    // Create a new room
    createRoom(roomId: string): boolean {
        if (this.rooms.has(roomId)) {
            return false;
        }

        this.rooms.set(roomId, new Set());
        return true;
    }

    // Add user to a room
    joinRoom(ws: WebSocket, roomId: string, username: string): boolean {
        this.createRoom(roomId);

        const room = this.rooms.get(roomId);

        if (!room) {
            return false;
        }

        if (room.has(ws)) {
            return false;
        }

        room.add(ws);
        this.userSocketMap.set(ws, username);

        // Notify all users in the room that a new user has joined
        // this.broadcastUserList(roomId);
        const message: JoinRoomMessage = {
            system: true,
            type: MessageType.JOIN_ROOM,
            roomId: roomId,
            username: username,
            content: `@${username} joined the room`
        };
        this.broadcastMessage(roomId, message);

        return true;
    }

    // Remove user from a room
    leaveRoom(ws: WebSocket, roomId: string, username: string): boolean {
        const room = this.rooms.get(roomId);

        if (!room) {
            return false;
        }

        room.delete(ws);

        // If room is empty, delete it
        if (room.size === 0) {
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
        const room = this.rooms.get(roomId);

        if (!room) {
            return;
        }

        const messageStr = JSON.stringify({
            ...message,
            timestamp: Date.now()
        });
        room.forEach(client => {
            client.send(messageStr);
        });
    }

    // Broadcast the list of users in a room
    broadcastUserList(roomId: string): void {
        const room = this.rooms.get(roomId);

        if (!room) {
            return;
        }

        const users: string[] = [];
        room.forEach(client => {
            const username = this.userSocketMap.get(client);
            if (username) {
                users.push(username);
            }
        });

        const message: UserListMessage = {
            system: true,
            type: MessageType.USER_LIST,
            roomId,
            users
        };

        this.broadcastMessage(roomId, message);
    }

    // Get all available rooms
    // getRooms(): string[] {
    //     return Array.from(this.rooms.keys());
    // }

    // Send an error message to a client
    sendError(ws: WebSocket, errorMessage: string): void {
        const message: ErrorMessage = {
            system: true,
            type: MessageType.ERROR,
            message: errorMessage
        };
        ws.send(JSON.stringify(message));
    }

    // Handle user disconnect
    handleDisconnect(ws: WebSocket): void {
        // Find which rooms this user is in and remove them
        console.log('Disconnecting user...');
        this.rooms.forEach((clients, roomId) => {
            console.log('roomId:', roomId);
            if (clients.has(ws)) {
                const username = this.userSocketMap.get(ws);
                console.log('username found:', username);
                if (!username) {
                    return;
                }
                this.leaveRoom(ws, roomId, username);
            }
        });
        this.userSocketMap.delete(ws);
    }
}
