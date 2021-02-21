import {
  assertEquals,
  assertNotEquals,
} from "https://deno.land/std@0.88.0/testing/asserts.ts";
import { Client, ClientOptions } from "../Client.ts";

Deno.test("[DiscordRex] create client with options", () => {
  const client = new Client();
  const options: ClientOptions = { enableLogs: true };
  const clientWithOptions = new Client(options);

  assertEquals(clientWithOptions.options, options);
  assertNotEquals(client.options, clientWithOptions.options);
});
