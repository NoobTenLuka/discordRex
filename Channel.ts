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

export interface FileContent {
  blob: Blob;
  name: string;
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
    files?: FileContent | FileContent[],
  ): Promise<Response> {
    let data: MessageRequest | FormData | null = null;

    if (typeof message === "string") {
      data = { content: message };
    } else if (Array.isArray(message)) {
      data = { content: message.join("\n") };
    } else {
      data = message;
    }

    if (files) {
      if (!Array.isArray(files)) {
        files = [files];
      }
      const oldData = data;
      data = new FormData();

      files.forEach((file, index) => {
        (data as FormData).append(
          `file${index}`,
          file.blob,
          file.name,
        );
      });

      data.append(
        "payload_json",
        JSON.stringify({ ...oldData, file: undefined }),
      );
    }

    return this.client.useAPI(
      "POST",
      `/channels/${this.id}/messages`,
      JSON.stringify(data),
    );
  }
}
