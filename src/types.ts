export enum MessageType {
  JOIN_ROOM = 'JOIN_ROOM',
  LEAVE_ROOM = 'LEAVE_ROOM',
  CHAT_MESSAGE = 'CHAT_MESSAGE',
  ERROR = 'ERROR',
  USER_LIST = 'USER_LIST'
}

export interface BaseMessage {
  system: boolean;
  type: MessageType;
}

export interface JoinRoomMessage extends BaseMessage {
  type: MessageType.JOIN_ROOM;
  roomId: string;
  username: string;
  content: string;
}

export interface LeaveRoomMessage extends BaseMessage {
  type: MessageType.LEAVE_ROOM;
  roomId: string;
  username: string;
  content: string;
}

export interface ChatMessage extends BaseMessage {
  type: MessageType.CHAT_MESSAGE;
  roomId: string;
  username: string;
  content: string;
  timestamp: number;
}

export interface ErrorMessage extends BaseMessage {
  type: MessageType.ERROR;
  roomId: string;
  username: string;
  content: string;
  timestamp: number;
}

export interface UserListMessage extends BaseMessage {
  type: MessageType.USER_LIST;
  roomId: string;
  users: string[];
}

export type Message = JoinRoomMessage | LeaveRoomMessage | ChatMessage | ErrorMessage | UserListMessage;
