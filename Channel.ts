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

export class FileContent {
  public readonly blob: Blob;
  public readonly name: string;

  constructor(blob: Blob, name: string) {
    this.blob = blob;
    this.name = name;
  }

  public static async loadFile(
    path: string | URL,
    filename: string,
  ): Promise<FileContent> {
    let data: Uint8Array;

    try {
      data = await Deno.readFile(path);
    } catch (err) {
      return Promise.reject(err);
    }

    return new FileContent(new Blob([data]), filename);
  }

  public static async loadFiles(
    ...fileInfos: ({ path: string | URL; filename: string })[]
  ) {
    const promises = fileInfos.map((fileInfo) => {
      return Deno.readFile(fileInfo.path);
    });

    let files: Uint8Array[] = [];
    try {
      files = await Promise.all(promises);
    } catch (err) {
      return Promise.reject(err);
    }

    return files.map((file) => {
      return new FileContent(new Blob([file]), "idk");
    });
  }
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
      data instanceof FormData ? data : JSON.stringify(data),
    );
  }
}
