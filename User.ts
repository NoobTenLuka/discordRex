import { Channel, FileContent } from "./Channel.ts";
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
    files?: FileContent | FileContent[],
  ): Promise<Response> {
    let channel: Channel | undefined;

    if (this.client.directMessageChannels.has(this.id)) {
      channel = this.client.directMessageChannels.get(this.id);
    } else {
      let res = null;
      try {
        res = await this.client.useAPI(
          "POST",
          `users/@me/channels`,
          JSON.stringify({ recipient_id: this.id }),
        );

        if (!res) {
          return Promise.reject(
            new Error(`Failed to open Direct Messages`),
          );
        }

        const json = await res.json();

        channel = new Channel(this.client, json.id, json.type);

        this.client.directMessageChannels.set(this.id, channel);
      } catch (error) {
        return Promise.reject(
          new Error(`Failed to open Direct Messages`),
        );
      }
    }

    if (!channel) {
      return Promise.reject(new Error("Failed to open Direct Messages"));
    }

    return channel.send(message, files);
  }
}
