import { Guild } from "./Guild.ts";
import { Message } from "./Message.ts";

export interface ClientEvents {
  READY: [];
  RESUMED: [];
  VOICE_SERVER_UPDATE: [];
  USER_UPDATE: [];
  GUILD_CREATE: [Guild];
  GUILD_DELETE: [];
  GUILD_ROLE_CREATE: [];
  GUILD_ROLE_UPDATE: [];
  GUILD_ROLE_DELETE: [];
  CHANNEL_CREATE: [];
  CHANNEL_UPDATE: [];
  CHANNEL_DELETE: [];
  CHANNEL_PINS_UPDATE: [];
  MESSAGE_CREATE: [Message];
  MESSAGE_UPDATE: [Message];
  MESSAGE_DELETE: [Message];
  MESSAGE_DELETE_BULK: [];
}
