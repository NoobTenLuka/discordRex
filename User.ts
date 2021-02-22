export class User {
  public readonly tag = `${this.username}#${this.discriminator}`;

  constructor(
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
}
