# Manager

Constructs a new Manager instance.

### Constructor

```ts
new Manager(options: ManagerOptions)
```

## Options

| Options                 | Type      | Description                                        |
| ----------------------- | :-------- | -------------------------------------------------- |
| `autoPlay`              | `boolean` | Indicates if songs should automatically play.      |
| `autoResume`            | `boolean` | Automatically resume players.                      |
| `autoMove`              | `boolean` | Move players to other node if node going down.     |
| `cliendId`              | `string`  | The ID of the client.                              |
| `redisUrl`              | `string`  | The URL of the redis server. used for auto resume. |
| `cliendName`            | `string`  | The name of the client.                            |
| `nodes`                 | `array`   | The list of NodeOptions.                           |
| `shards`                | `number`  | The number of shard count.                         |
| `defaultSearchPlatform` | `string`  | The default search platform.                       |

## Methods

### `send(id: string, payload: Payload): void`

Function to send data to the websocket.

> Returns: `void`

| Parameter | Type                           |
| --------- | :----------------------------- |
| `id`      | `string`                       |
| `payload` | [Payload](../typedefs/payload) |

### `sorter(nodes: Collection<string, Node>): Collection<string, Node>`

Function to sort nodes.

> Returns: `Collection<string, Node>`

| Parameter | Type                                        |
| --------- | :------------------------------------------ |
| `nodes`   | Collection<string, [Node](../classes/node)> |

## Overview

| Properties            | Methods                                 | Events                              |
| --------------------- | :-------------------------------------- | ----------------------------------- |
| [nodes](#•-nodes)     | [create](#•-create)                     | [nodeCreate](#•-nodecreate)         |
| [options](#•-options) | [createNode](#•-createnode)             | [nodeDestroy](#•-nodedestroy)       |
| [players](#•-players) | [decodeTrack](#•-decodetrack)           | [nodeConnect](#•-nodeconnect)       |
|                       | [decodeTracks](#•-decodetracks)         | [nodeReconnect](#•-nodereconnect)   |
|                       | [destroy](#•-destroy)                   | [nodeDisconnect](#•-nodedisconnect) |
|                       | [destroyNode](#•-destroynode)           | [nodeError](#•-nodeerror)           |
|                       | [get](#•-get)                           | [nodeRaw](#•-noderaw)               |
|                       | [init](#•-init)                         | [nodeSwitch](#•-nodeswitch)         |
|                       | [search](#•-search)                     | [playerCreate](#•-playercreate)     |
|                       | [updateVoiceState](#•-updatevoicestate) | [playerDestroy](#•-playerdestroy)   |
|                       |                                         | [queueEnd](#•-queueend)             |
|                       |                                         | [playerMove](#•-playermove)         |
|                       |                                         | [trackStart](#•-trackstart)         |
|                       |                                         | [trackEnd](#•-trackend)             |
|                       |                                         | [trackStuck](#•-trackstuck)         |
|                       |                                         | [trackError](#•-trackerror)         |
|                       |                                         | [socketClosed](#•-socketclosed)     |

### Events

#### • nodeCreate

> Emitted when a Node is created.
>
> | Parameter | Type                    |
> | --------- | :---------------------- |
> | node      | [Node](../classes/node) |

#### • nodeDestroy

> Emitted when a Node is destroyed.
>
> | Parameter | Type                    |
> | --------- | :---------------------- |
> | node      | [Node](../classes/node) |

#### • nodeConnect

> Emitted when a Node connects.
>
> | Parameter | Type                    |
> | --------- | :---------------------- |
> | node      | [Node](../classes/node) |

#### • nodeReconnect

> Emitted when a Node reconnects.
>
> | Parameter | Type                    |
> | --------- | :---------------------- |
> | node      | [Node](../classes/node) |

#### • nodeDisconnect

> Emitted when a Node disconnects.
>
> | Parameter | Type                                |
> | --------- | :---------------------------------- |
> | node      | [Node](../classes/node)             |
> | reason    | `{ code: number , reason: string }` |

#### • nodeError

> Emitted when a Node has an error.
>
> | Parameter | Type                    |
> | --------- | :---------------------- |
> | node      | [Node](../classes/node) |
> | error     | Error                   |

#### • nodeRaw

> Emitted whenever any Lavalink event is received.
>
> | Parameter | Type    |
> | --------- | :------ |
> | payload   | unknown |

#### • nodeSwitch

> Emitted when a Node is switched.
>
> | Parameter | Type                        |
> | --------- | :-------------------------- |
> | player    | [Player](../classes/player) |
> | oldNode   | [Node](../classes/node)     |
> | newNode   | [Node](../classes/node)     |

#### • playerCreate

> Emitted when a player is created.
>
> | Parameter | Type                        |
> | --------- | :-------------------------- |
> | player    | [Player](../classes/player) |

#### • playerDestroy

> Emitted when a player is destroyed.
>
> | Parameter | Type                        |
> | --------- | :-------------------------- |
> | player    | [Player](../classes/player) |

#### • queueEnd

> Emitted when a player queue ends.
>
> | Parameter | Type                        |
> | --------- | :-------------------------- |
> | player    | [Player](../classes/player) |

#### • playerMove

> Emitted when a player is moved to a new voice channel.
>
> | Parameter  | Type                        |
> | ---------- | :-------------------------- |
> | player     | [Player](../classes/player) |
> | oldChannel | string                      |
> | newChannel | string                      |

#### • trackStart

> Emitted when a track starts.
>
> | Parameter | Type                                           |
> | --------- | :--------------------------------------------- |
> | player    | [Player](../classes/player)                    |
> | track     | [Track](../typedefs/track)                     |
> | payload   | [TrackStartEvent](../typedefs/trackStartEvent) |

#### • trackEnd

> Emitted when a track ends.
>
> | Parameter | Type                                       |
> | --------- | :----------------------------------------- |
> | player    | [Player](../classes/player)                |
> | track     | [Track](../typedefs/track)                 |
> | payload   | [TrackEndEvent](../typedefs/trackEndEvent) |

#### • trackStuck

> Emitted when a track gets stuck during playback.
>
> | Parameter | Type                                           |
> | --------- | :--------------------------------------------- |
> | player    | [Player](../classes/player)                    |
> | track     | [Track](../typedefs/track)                     |
> | payload   | [TrackStuckEvent](../typedefs/trackStuckEvent) |

#### • trackError

> Emitted when a track has an error during playback.
>
> | Parameter | Type                                                   |
> | --------- | :----------------------------------------------------- |
> | player    | [Player](../classes/player)                            |
> | track     | [Track](../typedefs/track)                             |
> | payload   | [TrackExceptionEvent](../typedefs/trackExceptionEvent) |

#### • socketClosed

> Emitted when a voice connection is closed.
>
> | Parameter | Type                                                     |
> | --------- | :------------------------------------------------------- |
> | player    | [Player](../classes/player)                              |
> | payload   | [WebSocketClosedEvent](../typedefs/webSocketClosedEvent) |

### Properties

#### • nodes

> The map of nodes.
>
> | Type                                        | Value                          |
> | ------------------------------------------- | :----------------------------- |
> | Collection<string, [Node](../classes/node)> | new Collection<string, Node>() |

#### • options

> The options that were set.
>
> | Type                           |
> | ------------------------------ |
> | [ManagerOptions](#constructor) |

#### • players

> The map of players.
>
> | Type                                            | Value                            |
> | ----------------------------------------------- | :------------------------------- |
> | Collection<string, [Player](../classes/player)> | new Collection<string, Player>() |

### Methods

#### • create()

> Creates a player or returns one if it already exists.
>
> Returns: [Player](../classes/player)
>
> | Parameter | Type                                           |
> | --------- | :--------------------------------------------- |
> | options   | [PlayerOptions](../classes/player#constructor) |

#### • createNode()

> Creates a node or returns one if it already exists.
>
> Returns: [Node](../classes/node)
>
> | Parameter | Type                                       |
> | --------- | :----------------------------------------- |
> | options   | [NodeOptions](../classes/node#constructor) |

#### • decodeTrack()

> Decodes the base64 encoded track and returns a TrackData.
>
> Returns: Promise<[TrackData](../typedefs/trackData)>
>
> | Parameter | Type   |
> | --------- | :----- |
> | track     | string |

#### • decodeTracks()

> Decodes the base64 encoded tracks and returns a TrackData array.
>
> Returns: Promise<[TrackData](../typedefs/trackData)`[]`>
>
> | Parameter | Type       |
> | --------- | :--------- |
> | tracks    | string`[]` |

#### • destroy()

> Destroys a player if it exists.
>
> Returns: `void`
>
> | Parameter | Type   |
> | --------- | :----- |
> | guild     | string |

#### • destroyNode()

> Destroys a node if it exists.
>
> Returns: `void`
>
> | Parameter  | Type   |
> | ---------- | :----- |
> | identifier | string |

#### • get()

> Returns a player or undefined if it does not exist.
>
> Returns: [Player](../classes/player) | `undefined`
>
> | Parameter | Type   |
> | --------- | :----- |
> | guild     | string |

#### • init()

> Initiates the Manager.
>
> Returns: `this`
>
> | Parameter | Type   |
> | --------- | :----- |
> | clientId  | string |

#### • search()

> Searches the enabled sources based off the URL or the `source` property.
>
> Returns: Promise<[SearchResult](../typedefs/searchResult)>
>
> | Parameter            | Type    |
> | -------------------- | :------ |
> | query                | string  |
> | `Optional` requester | unknown |

#### • updateVoiceState()

> Sends voice data to the Lavalink server.
>
> Returns: `void`
>
> | Parameter | Type                                   |
> | --------- | :------------------------------------- |
> | data      | [VoicePacket](../typedefs/voicePacket) |
