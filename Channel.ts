import { MessageRequest } from "./Message.ts";
import { Client } from "./Client.ts";

export enum ChannelType {
  TEXT,
  DM,
  VOICE,
  GROUP_DM,
  CATEGORY,
  NEWS,
  STROE,
}

export class Channel {
  constructor(
    readonly client: Client,
    readonly id: string,
  ) {
  }

  public send(message: string | string[] | MessageRequest): Promise<Response> {
    let data = null;

    if (typeof message === "string") {
      data = JSON.stringify({ content: message });
    } else if (Array.isArray(message)) {
      data = JSON.stringify({ content: message.join("") });
    } else {
      data = JSON.stringify(message);
    }

    return this.client.useAPI("POST", `/channels/${this.id}/messages`, data);
  }
}
