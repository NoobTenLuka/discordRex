This is a deno library for interacting with the discord websocket gateway and http api.

The simplest example of a discord bot
```ts
import { Client } from "https://raw.githubusercontent.com/NoobTenLuka/discordRex/master/mod.ts";

const client = new Client();

client.registerHandler("MESSAGE_CREATE", message => {
  if(!message.content.startsWith('!ping')) {
    return;
  }

  message.reply("Pong!");
})

client.login(secret_discord_token);
```