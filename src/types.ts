/**
 * Message types supported by the chat application
 */
export enum MessageType {
  JOIN_ROOM = 'JOIN_ROOM',
  LEAVE_ROOM = 'LEAVE_ROOM',
  CHAT_MESSAGE = 'CHAT_MESSAGE',
  IMAGE_MESSAGE = 'IMAGE_MESSAGE',
  USER_LIST = 'USER_LIST',
  ERROR = 'ERROR',
}

/**
 * Base interface for all message types
 */
export interface BaseMessage {
  /** Whether this message is from the system or a user */
  system: boolean;
  /** Type of the message */
  type: MessageType;
}

/**
 * Message sent when a user joins a room
 */
export interface JoinRoomMessage extends BaseMessage {
  type: MessageType.JOIN_ROOM;
  /** ID of the room being joined */
  roomId: string;
  /** Username of the user joining */
  username: string;
  /** Message content */
  content: string;
}

/**
 * Message sent when a user leaves a room
 */
export interface LeaveRoomMessage extends BaseMessage {
  type: MessageType.LEAVE_ROOM;
  /** ID of the room being left */
  roomId: string;
  /** Username of the user leaving */
  username: string;
  /** Message content */
  content: string;
}

/**
 * Regular chat message sent by a user
 */
export interface ChatMessage extends BaseMessage {
  type: MessageType.CHAT_MESSAGE;
  /** ID of the room this message belongs to */
  roomId: string;
  /** Username of the sender */
  username: string;
  /** Message content */
  content: string;
  /** Timestamp when the message was sent */
  timestamp: number;
}

/**
 * Image message sent by a user
 */
export interface ImageMessage extends BaseMessage {
  type: MessageType.IMAGE_MESSAGE;
  /** ID of the room this message belongs to */
  roomId: string;
  /** Username of the sender */
  username: string;
  /** Base64-encoded image data */
  imageData: string;
  /** Image caption */
  caption: string;
  /** Timestamp when the message was sent */
  timestamp: number;
}

/**
 * Error message sent by the system
 */
export interface ErrorMessage extends BaseMessage {
  type: MessageType.ERROR;
  /** ID of the room where the error occurred */
  roomId: string;
  /** Username to whom the error relates */
  username: string;
  /** Error message content */
  content: string;
  /** Timestamp when the error occurred */
  timestamp: number;
}

/**
 * Message containing a list of users in a room
 */
export interface UserListMessage extends BaseMessage {
  /** ID of the room */
  roomId: string;
  /** List of usernames in the room */
  users: string[];
}

/**
 * Union type of all possible message types
 */
export type Message = JoinRoomMessage | LeaveRoomMessage | ChatMessage | ErrorMessage | UserListMessage;
