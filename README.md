# Discord Rex
A deno library for interacting with the discord websocket gateway and http api.

## Technologies used

The library is 100% written in [Typescript](https://www.typescriptlang.org/) with type notation for every exposed variable.
Furthermore, the library is designed to be used with [Deno](https://deno.land/)

Version used:
* Deno: 1.7.4
* Typescript: 4.1.4

## Installation and Use

You only need to import the mod.ts file into a typescript file

```ts
import * as Discord from "https://raw.githubusercontent.com/NoobTenLuka/discordRex/master/mod.ts";
```

after that you can use the exported classes to create a bot and log in using a bot token. 
You can get such a token from the [Discord Developer Website](https://discord.com/developers/applications)

```ts
const client = new Discord.Client();

// Register handlers for discord events

client.login('super-secret-token');
```

## Examples

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

client.login('super-secret-token');
```