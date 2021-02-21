import { unimplemented } from "https://deno.land/std@0.88.0/testing/asserts.ts";
import { Channel } from "./Channel.ts";
import { ClientEvents } from "./ClientEvents.ts";
import { User } from "./User.ts";
import { Message, MessageType } from "./Message.ts";
import { Guild } from "./Guild.ts";

export interface HttpOptions {
  apiVersion?: number;
}

export interface WebsocketOptions {
  gatwayVersion?: number;
}

export interface ClientOptions {
  debug?: boolean;
  intents?: number;
  httpOptions?: HttpOptions;
  websocketOptions?: WebsocketOptions;
}

/**
 * The class of the discord client which registers event handlers (via `.registerHandler()`) 
 * and then executes them whenever the event is received (via `.login()`)
 * @example
 * // Example bot with a ping command
 * const client = new Client();
 * 
 * client.registerHandler("MESSAGE_CREATE", message => {
 *  if(message.author.bot) {
 *    return;
 *  }
 * 
 *  if(!message.content.startsWith('!ping')) {
 *    return;
 *  }
 * 
 *  message.channel.send(`${message.author}, pong!`);
 * 
 * })
 * 
 * client.login(secretToken);
 */
export class Client {
  /**
   * The default options of the discord client
   */
  public static DEFAULT_OPTIONS: ClientOptions = {
    debug: false,
    intents: 4609,
    httpOptions: {
      apiVersion: 8,
    },
    websocketOptions: {
      gatwayVersion: 8,
    },
  };

  private _currentUser: User | null = null;
  private loggedIn = false;

  /**
   * Returns the current discord user that this client represents. 
   */
  public get currentUser() {
    return this._currentUser;
  }

  private webSocket!: WebSocket;
  private receivedHello = false;
  private lastSequenceNumber: number | null = null;
  private heartbeatAck = true;

  // deno-lint-ignore no-explicit-any
  private handlers = new Map<keyof ClientEvents, (...args: any) => void>();

  private _options: ClientOptions;

  private token = "";

  /**
   * Returns the current options of this discord client
   * @default `Client.DEFAULT_OPTIONS`
   */
  public get options() {
    return this._options;
  }

  /**
   * Creates a new discord client with the defined options
   * @param options Optional configuration that gets mixed with the default
   */
  public constructor(options?: ClientOptions) {
    this._options = { ...Client.DEFAULT_OPTIONS, ...options };
  }

  /**
   * Registers a new handler, which gets executed as soon as the event triggers.
   * @param event The discord event which the handler listens for
   * @param handler The function that gets executed
   */
  public registerHandler<T extends keyof ClientEvents>(
    event: T,
    handler: (...args: ClientEvents[T]) => void,
  ) {
    this.handlers.set(event, handler);
  }

  /**
   * Starts a new websocket connection to the discord gateway
   */
  private startWebSocketClient() {
    this.webSocket = new WebSocket(
      `wss://gateway.discord.gg/?v=${this._options.websocketOptions
        ?.gatwayVersion}&encoding=json`,
    );
    this.webSocket.onclose = this.onClose.bind(this);
    this.webSocket.onmessage = this.onMessage.bind(this);
    this.webSocket.onerror = this.onError.bind(this);

    if (this.loggedIn) {
      this.login(this.token);
    }

    this.loggedIn = true;
  }

  /**
   * Handles websocket closing events
   * @param event Websocket close event 
   */
  private onClose(event: CloseEvent) {
    if (this._options.debug) {
      console.error(`The Websocket stopped due to ${event.reason}`);
    }
  }

  /**
   * Handles websocket errors
   * @param event The error event
   */
  private onError(event: Event | ErrorEvent) {
    if (this._options.debug) {
      if (event instanceof ErrorEvent) {
        console.error(`The websocket had an error: ${event.message}`);
      } else {
        console.error(`The websocket had an error!`);
      }
    }
  }

  /**
   * Handles incoming messages from the discord gateway 
   * @param event A websocket message event
   */
  private onMessage(event: MessageEvent) {
    const data = JSON.parse(event.data);

    if (this._options.debug) {
      console.log(data);
    }

    // cache the last sequence number that the gateway has sent
    this.lastSequenceNumber = data?.s;

    switch (data?.op) {
      // opcode 0 = Event
      case 0:
        this.handleEvent(data);
        break;
      // opcode 10 = Hello message with heartbeat rythm
      case 10:
        this.receivedHello = true;
        this.startHeartbeat(data?.d?.heartbeat_interval);
        break;
      // opcode 11 = Heartbeat acknowledged
      case 11:
        this.heartbeatAck = true;
        break;
      // all other opcodes = unimplemented!
      default:
        if (this._options.debug) {
          console.log(`Opcode ${data?.op} is not implemented!`);
        }
        unimplemented();
    }
  }

  /**
   * Handles incoming events from the discord gateway.
   * @param data A data object, where t is the event and d is the data for that event
   */
  private handleEvent(
    data: { t: keyof ClientEvents; d: Record<string, unknown> },
  ) {
    const handler = this.handlers.get(data.t);

    if (!handler) {
      if (this._options.debug) {
        console.log(`Handler for event ${String(data.t)} was not found!`);
      }
      return;
    }

    switch (data.t) {
      case "READY":
        this._currentUser = data.d.user as User;
        break;
      case "MESSAGE_CREATE":
      case "MESSAGE_UPDATE":
      case "MESSAGE_DELETE": {
        const user = (data.d.author as Record<string, unknown>);

        handler(
          new Message(
            this,
            new User(
              user.id as string,
              user.username as string,
              user.descriminator as string,
              user.avatar as string | null,
              user?.bot as boolean | undefined,
            ),
            new Channel(this, data.d.channel_id as string),
            data?.d.content as string,
            new Guild(
              data.d.guild_id as string,
            ),
            data?.d.id as string,
            data?.d.tts as boolean,
            data?.d.type as MessageType,
          ),
        );
        break;
      }
      default:
        handler();
        break;
    }
  }

  /**
   * Starts the heartbeat to the discord gateway
   * @param ms The milliseconds between each heartbeat, defined in the "Hello" message from the gateway
   */
  private startHeartbeat(ms: number) {
    if (this._options.debug) {
      console.log(`Sending heartbeat every ${ms}ms`);
    }

    setInterval(() => {
      if (this.heartbeatAck) {
        const heartbeat = { op: 1, d: this.lastSequenceNumber };
        this.webSocket.send(JSON.stringify(heartbeat));
      } else {
        if (this._options.debug) {
          console.log(
            `Last heartbeat was not acknowledged. Closing connection and trying again!`,
          );
        }
        this.webSocket.close();
        this.startWebSocketClient();
      }
    }, ms);
  }

  /**
   * Starts the websocket connection to the discord gateway
   * @param token The discord bot token. Get one at https://discord.com/developers/applications
   */
  public login(token: string) {
    if (!this.loggedIn) {
      this.startWebSocketClient();
    }

    if (this.receivedHello) {
      if (this._options.debug) {
        console.log("Will now attemt to identify");
      }

      const identify = {
        token,
        properties: {
          $os: Deno.build.os,
          $browser: "deno",
          $device: "discordRex",
        },
        intents: this._options.intents,
      };
      this.webSocket.send(JSON.stringify({ op: 2, d: identify }));

      this.token = token;
      return;
    }

    setTimeout(() => this.login(token), 1);
  }

  /**
   * This method makes an HTTP request to the Discord API.
   * 
   * Be aware!
   * This method is designed to be used internally but can also be used by the end user.
   * Parameters are not checked before sending!
   * @param method The HTTP Method to be used on the API
   * @param endpoint The endpoint on the discord api
   * @param body The HTTP Body for the request
   */
  public useAPI(
    method: "GET" | "POST" | "DELETE",
    endpoint: string,
    body?: string,
  ) {
    if (this.token === "") {
      if (this._options.debug) {
        console.log("Can't request the API without being logged in!");
      }
      return;
    }

    fetch(
      `https://discord.com/api/v${this._options.httpOptions?.apiVersion}/${
        endpoint.startsWith("/") ? endpoint.substr(1) : endpoint
      }`,
      {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bot ${this.token}`,
          "User-Agent": "DiscordBot (none, 0.1)",
        },
        body,
      },
    );
  }
}