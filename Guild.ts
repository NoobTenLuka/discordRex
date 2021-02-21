import { Channel } from "./Channel.ts";
import { User } from "./User.ts";

export class Guild {
  constructor(
    readonly id: string,
    readonly name?: string,
    readonly owner?: User,
    readonly channels?: Channel[],
  ) {
  }
}
