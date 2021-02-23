import { Client } from "./Client.ts";
import { MessageRequest } from "./Message.ts";

export class User {
  public readonly tag = `${this.username}#${this.discriminator}`;

  constructor(
    readonly client: Client,
    readonly id: string,
    readonly username?: string,
    readonly discriminator?: string,
    readonly avatar?: string | null,
    readonly bot?: boolean,
  ) {
  }

  /**
   * Converts the user into a string, which can be used to mention the user in discord messages
   */
  public toString(): string {
    return `<@${this.id}>`;
  }

  public async dm(
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

    let res: null | Response = null;

    try {
      res = await this.client.useAPI(
        "POST",
        `users/@me/channels`,
        JSON.stringify({ recipient_id: this.id }),
      );
    } catch (error) {
      return Promise.reject(
        new Error(`Failed to open Direct Messages`),
      );
    }

    if (!res) {
      return Promise.reject(
        new Error(`Failed to open Direct Messages`),
      );
    }

    const json = await res.json();

    return this.client.useAPI(
      "POST",
      `/channels/${json.id}/messages`,
      data,
    );
  }
}
