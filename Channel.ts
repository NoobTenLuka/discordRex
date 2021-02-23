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
    readonly type: ChannelType,
  ) {
  }
  public send(
    message: string | string[] | MessageRequest,
    file?: File,
  ): Promise<Response> {
    let data = null;

    if (typeof message === "string") {
      data = JSON.stringify({ content: message });
    } else if (Array.isArray(message)) {
      data = JSON.stringify({ content: message.join("\n") });
    } else {
      data = JSON.stringify(message);
    }

    if (file) {
      const oldData = data;
      data = new FormData();
      data.append("payload_json", oldData);
      data.append("file", file);
    }

    return this.client.useAPI("POST", `/channels/${this.id}/messages`, data);
  }
}
