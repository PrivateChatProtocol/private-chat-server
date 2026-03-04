import { describe, test, expect, beforeEach, jest } from "bun:test";
import { ElysiaWS } from "elysia/ws";
import { ChatManager } from "../chat-manager";
import { MessageType } from "../types";

// Suppress logger output during tests
process.env.NODE_ENV = "production";

function createMockWs(id = "ws-1") {
    return { id, send: jest.fn() } as unknown as ElysiaWS;
}

function parseSent(ws: ReturnType<typeof createMockWs>, callIndex = 0) {
    const raw = (ws.send as ReturnType<typeof jest.fn>).mock.calls[callIndex][0];
    return JSON.parse(raw as string);
}

// ---------------------------------------------------------------------------

describe("ChatManager.createRoom", () => {
    let manager: ChatManager;
    beforeEach(() => { manager = new ChatManager(); });

    test("creates a new room and returns true", () => {
        expect(manager.createRoom("room-1")).toBe(true);
    });

    test("returns false if room already exists", () => {
        manager.createRoom("room-1");
        expect(manager.createRoom("room-1")).toBe(false);
    });
});

// ---------------------------------------------------------------------------

describe("ChatManager.joinRoom", () => {
    let manager: ChatManager;
    beforeEach(() => { manager = new ChatManager(); });

    test("returns null on successful join", () => {
        const ws = createMockWs();
        expect(manager.joinRoom(ws, "room-1", "alice")).toBeNull();
    });

    test("creates room automatically if it does not exist", () => {
        const ws = createMockWs();
        manager.joinRoom(ws, "new-room", "alice");
        expect(manager.isInRoom(ws, "new-room")).toBe(true);
    });

    test("returns error for empty roomId", () => {
        expect(manager.joinRoom(createMockWs(), "", "alice")).toBe("Invalid room ID or username");
    });

    test("returns error for roomId that is too long", () => {
        expect(manager.joinRoom(createMockWs(), "a".repeat(65), "alice")).toBe("Invalid room ID or username");
    });

    test("returns error for roomId with special characters", () => {
        expect(manager.joinRoom(createMockWs(), "room@1", "alice")).toBe("Invalid room ID or username");
    });

    test("returns error for empty username", () => {
        expect(manager.joinRoom(createMockWs(), "room-1", "")).toBe("Invalid room ID or username");
    });

    test("returns error for username with special characters", () => {
        expect(manager.joinRoom(createMockWs(), "room-1", "ali ce")).toBe("Invalid room ID or username");
    });

    test("returns error for duplicate username in same room", () => {
        manager.joinRoom(createMockWs("ws-1"), "room-1", "alice");
        expect(manager.joinRoom(createMockWs("ws-2"), "room-1", "alice")).toBe("Username already taken");
    });

    test("returns error for duplicate connection", () => {
        const ws = createMockWs();
        manager.joinRoom(ws, "room-1", "alice");
        expect(manager.joinRoom(ws, "room-1", "bob")).toBe("Already joined this room");
    });

    test("broadcasts JOIN_ROOM to all members after join", () => {
        const ws1 = createMockWs("ws-1");
        const ws2 = createMockWs("ws-2");
        manager.joinRoom(ws1, "room-1", "alice");
        manager.joinRoom(ws2, "room-1", "bob");

        // ws1 should have received the JOIN_ROOM broadcast for bob
        const calls = (ws1.send as ReturnType<typeof jest.fn>).mock.calls;
        const joinMsg = calls.map((c: any[]) => JSON.parse(c[0] as string))
            .find((m: any) => m.type === MessageType.JOIN_ROOM && m.username === "bob");
        expect(joinMsg).toBeDefined();
    });

    test("broadcasts USER_LIST after join", () => {
        const ws1 = createMockWs("ws-1");
        const ws2 = createMockWs("ws-2");
        manager.joinRoom(ws1, "room-1", "alice");
        manager.joinRoom(ws2, "room-1", "bob");

        const calls = (ws2.send as ReturnType<typeof jest.fn>).mock.calls;
        const userListMsg = calls.map((c: any[]) => JSON.parse(c[0] as string))
            .find((m: any) => m.type === MessageType.USER_LIST);
        expect(userListMsg?.users).toEqual(expect.arrayContaining(["alice", "bob"]));
    });

    test("accepts valid IDs with underscores and hyphens", () => {
        const ws = createMockWs();
        expect(manager.joinRoom(ws, "my_room-1", "user_name-1")).toBeNull();
    });

    test("accepts roomId and username exactly 64 chars long", () => {
        const id = "a".repeat(64);
        expect(manager.joinRoom(createMockWs(), id, id)).toBeNull();
    });
});

// ---------------------------------------------------------------------------

describe("ChatManager.leaveRoom", () => {
    let manager: ChatManager;
    beforeEach(() => { manager = new ChatManager(); });

    test("returns true on successful leave", () => {
        const ws = createMockWs();
        manager.joinRoom(ws, "room-1", "alice");
        expect(manager.leaveRoom(ws, "room-1", "alice")).toBe(true);
    });

    test("returns false for non-existent room", () => {
        expect(manager.leaveRoom(createMockWs(), "ghost-room", "alice")).toBe(false);
    });

    test("deletes room when last user leaves", () => {
        const ws = createMockWs();
        manager.joinRoom(ws, "room-1", "alice");
        manager.leaveRoom(ws, "room-1", "alice");
        expect(manager.isInRoom(ws, "room-1")).toBe(false);
    });

    test("does not broadcast when last user leaves (room deleted)", () => {
        const ws = createMockWs();
        manager.joinRoom(ws, "room-1", "alice");
        (ws.send as ReturnType<typeof jest.fn>).mockClear();
        manager.leaveRoom(ws, "room-1", "alice");
        expect((ws.send as ReturnType<typeof jest.fn>).mock.calls).toHaveLength(0);
    });

    test("broadcasts LEAVE_ROOM to remaining members", () => {
        const ws1 = createMockWs("ws-1");
        const ws2 = createMockWs("ws-2");
        manager.joinRoom(ws1, "room-1", "alice");
        manager.joinRoom(ws2, "room-1", "bob");
        (ws2.send as ReturnType<typeof jest.fn>).mockClear();

        manager.leaveRoom(ws1, "room-1", "alice");

        const msgs = (ws2.send as ReturnType<typeof jest.fn>).mock.calls
            .map((c: any[]) => JSON.parse(c[0] as string));
        expect(msgs.some((m: any) => m.type === MessageType.LEAVE_ROOM && m.username === "alice")).toBe(true);
    });

    test("broadcasts USER_LIST to remaining members after leave", () => {
        const ws1 = createMockWs("ws-1");
        const ws2 = createMockWs("ws-2");
        manager.joinRoom(ws1, "room-1", "alice");
        manager.joinRoom(ws2, "room-1", "bob");
        (ws2.send as ReturnType<typeof jest.fn>).mockClear();

        manager.leaveRoom(ws1, "room-1", "alice");

        const msgs = (ws2.send as ReturnType<typeof jest.fn>).mock.calls
            .map((c: any[]) => JSON.parse(c[0] as string));
        const userList = msgs.find((m: any) => m.type === MessageType.USER_LIST);
        expect(userList?.users).toEqual(["bob"]);
    });
});

// ---------------------------------------------------------------------------

describe("ChatManager.isInRoom", () => {
    let manager: ChatManager;
    beforeEach(() => { manager = new ChatManager(); });

    test("returns true when ws is in room", () => {
        const ws = createMockWs();
        manager.joinRoom(ws, "room-1", "alice");
        expect(manager.isInRoom(ws, "room-1")).toBe(true);
    });

    test("returns false when ws is not in room", () => {
        const ws1 = createMockWs("ws-1");
        const ws2 = createMockWs("ws-2");
        manager.joinRoom(ws1, "room-1", "alice");
        expect(manager.isInRoom(ws2, "room-1")).toBe(false);
    });

    test("returns false for non-existent room", () => {
        expect(manager.isInRoom(createMockWs(), "ghost-room")).toBe(false);
    });
});

// ---------------------------------------------------------------------------

describe("ChatManager.broadcastMessage", () => {
    let manager: ChatManager;
    beforeEach(() => { manager = new ChatManager(); });

    test("sends message to all clients in room", () => {
        const ws1 = createMockWs("ws-1");
        const ws2 = createMockWs("ws-2");
        manager.joinRoom(ws1, "room-1", "alice");
        manager.joinRoom(ws2, "room-1", "bob");
        (ws1.send as ReturnType<typeof jest.fn>).mockClear();
        (ws2.send as ReturnType<typeof jest.fn>).mockClear();

        manager.broadcastMessage("room-1", {
            system: false,
            type: MessageType.CHAT_MESSAGE,
            roomId: "room-1",
            username: "alice",
            content: "hello",
            timestamp: 0,
        });

        expect((ws1.send as ReturnType<typeof jest.fn>).mock.calls).toHaveLength(1);
        expect((ws2.send as ReturnType<typeof jest.fn>).mock.calls).toHaveLength(1);
    });

    test("adds timestamp to the message", () => {
        const ws = createMockWs();
        manager.joinRoom(ws, "room-1", "alice");
        (ws.send as ReturnType<typeof jest.fn>).mockClear();

        manager.broadcastMessage("room-1", {
            system: false,
            type: MessageType.CHAT_MESSAGE,
            roomId: "room-1",
            username: "alice",
            content: "hello",
            timestamp: 0,
        });

        const sent = parseSent(ws, 0);
        expect(typeof sent.timestamp).toBe("number");
        expect(sent.timestamp).toBeGreaterThan(0);
    });

    test("does not throw for non-existent room", () => {
        expect(() =>
            manager.broadcastMessage("ghost-room", {
                system: true,
                type: MessageType.CHAT_MESSAGE,
                roomId: "ghost-room",
                username: "alice",
                content: "hi",
                timestamp: 0,
            })
        ).not.toThrow();
    });
});

// ---------------------------------------------------------------------------

describe("ChatManager.sendError", () => {
    let manager: ChatManager;
    beforeEach(() => { manager = new ChatManager(); });

    test("sends error only to the target client", () => {
        const ws1 = createMockWs("ws-1");
        const ws2 = createMockWs("ws-2");
        manager.joinRoom(ws1, "room-1", "alice");
        manager.joinRoom(ws2, "room-1", "bob");
        (ws1.send as ReturnType<typeof jest.fn>).mockClear();
        (ws2.send as ReturnType<typeof jest.fn>).mockClear();

        manager.sendError(ws1, {
            system: true,
            type: MessageType.ERROR,
            roomId: "room-1",
            content: "something went wrong",
            timestamp: Date.now(),
        });

        expect((ws1.send as ReturnType<typeof jest.fn>).mock.calls).toHaveLength(1);
        expect((ws2.send as ReturnType<typeof jest.fn>).mock.calls).toHaveLength(0);
    });
});

// ---------------------------------------------------------------------------

describe("ChatManager.handleDisconnect", () => {
    let manager: ChatManager;
    beforeEach(() => { manager = new ChatManager(); });

    test("removes user from all rooms on disconnect", () => {
        const ws = createMockWs();
        manager.joinRoom(ws, "room-1", "alice");
        manager.joinRoom(ws, "room-2", "alice");

        // Can't join same connection twice in same room, but can join different rooms
        // However joinRoom blocks same ws in same room, so we test two rooms
        manager.handleDisconnect(ws);

        expect(manager.isInRoom(ws, "room-1")).toBe(false);
        expect(manager.isInRoom(ws, "room-2")).toBe(false);
    });

    test("notifies remaining members when user disconnects from a room", () => {
        const ws1 = createMockWs("ws-1");
        const ws2 = createMockWs("ws-2");
        manager.joinRoom(ws1, "room-1", "alice");
        manager.joinRoom(ws2, "room-1", "bob");
        (ws2.send as ReturnType<typeof jest.fn>).mockClear();

        manager.handleDisconnect(ws1);

        const msgs = (ws2.send as ReturnType<typeof jest.fn>).mock.calls
            .map((c: any[]) => JSON.parse(c[0] as string));
        expect(msgs.some((m: any) => m.type === MessageType.LEAVE_ROOM)).toBe(true);
    });
});
