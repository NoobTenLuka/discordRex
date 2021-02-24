import { Channel, FileContent } from "./Channel.ts";
import { Client } from "./Client.ts";
import { Guild } from "./Guild.ts";
import { User } from "./User.ts";

export enum MessageType {
  DEFAULT,
  RECIPIENT_ADD,
  RECIPIENT_REMOVE,
  CALL,
  CHANNEL_NAME_CHANGE,
  CHANNEL_ICON_CHANGE,
  CHANNEL_PINNED_MESSAGE,
  GUILD_MEMBER_JOIN,
  USER_PREMIUM_GUILD_SUBSCRIPTION,
  USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_1,
  USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_2,
  USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_3,
  CHANNEL_FOLLOW_ADD,
  GUILD_DISCOVERY_DISQUALIFIED = 14,
  GUILD_DISCOVERY_REQUALIFIED,
  REPLY = 19,
  APPLICATION_COMMAND,
}

export interface MessageRequest {
  content: string;
  nonce?: number | string;
  tts?: boolean;
  embed?: Record<string, unknown>; // TODO: change to embed interface
  // deno-lint-ignore camelcase Parameter name is specified in the discord API
  allowed_mentions?: Record<string, unknown>; // TODO: change to allowed_mentions interface
  // deno-lint-ignore camelcase Parameter name is specified in the discord API
  message_reference?: Record<string, unknown>; // TODO: change to message_reference interface
}

export class Message {
  constructor(
    readonly client: Client,
    readonly author: User,
    readonly channel: Channel,
    readonly content: string,
    readonly guild: Guild,
    readonly id: string,
    readonly tts: boolean,
    readonly type: MessageType,
  ) {
  }

  /**
   * Sends a reply to the message
   * @param message The message to be send in the reply
   */
  public reply(
    message: string | string[],
    files?: FileContent | FileContent[],
  ) {
    let content = "";

    if (Array.isArray(message)) {
      content = message.join("\n");
    } else {
      content = message;
    }

    const request: MessageRequest = {
      content,
      // deno-lint-ignore camelcase Parameter name is specified in the discord API
      message_reference: {
        message_id: this.id,
        channel_id: this.channel.id,
        guild_id: this.guild.id,
      },
    };

    return this.channel.send(request, files);
  }
}
