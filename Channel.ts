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
  private client: Client;
  private _id: string;

  public get id() {
    return this._id;
  }

  constructor(discordClient: Client, id: string) {
    this.client = discordClient;
    this._id = id;
  }

  public send(message: string | MessageRequest) {
    const data = typeof message === "string"
      ? JSON.stringify({ content: message })
      : JSON.stringify(message);

    this.client.useAPI("POST", `/channels/${this._id}/messages`, data);
  }
}
