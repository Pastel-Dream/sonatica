# Node

### Constructor

```js
new Node(options: NodeOptions)
```

## Properties

| Options       | Type      | Description                                                   |
| ------------- | :-------- | ------------------------------------------------------------- |
| `host`        | `string`  | The host for the node.                                        |
| `identifier`  | `string`  | The identifier for the node.                                  |
| `password`    | `string`  | The password for the node.                                    |
| `port`        | `number`  | The port for the node.                                        |
| `retryAmount` | `number`  | How many tries connect to the node if connection failed.      |
| `retryDelay`  | `number`  | Timeout to retry connecting to the node if connection failed. |
| `secure`      | `boolean` | Whether the host uses SSL.                                    |
| `search`      | `boolean` | Whether to enable the search functionality.                   |
| `playback`    | `boolean` | Whether to enable the playback.                               |

## Overview

| Properties                      | Methods                       |
| ------------------------------- | :---------------------------- |
| [`manager`](#•-manager)         | [`connect`](#•-connect)       |
| [`options`](#•-options)         | [`destroy`](#•-destroy)       |
| [`socket`](#•-socket)           | [`setEnabled`](#•-setenabled) |
| [`stats`](#•-stats)             |                               |
| [`connected`](#•-get-connected) |                               |
| [`isEnabled`](#•-isenabled)     |                               |

### Properties

#### • manager

> The main hub for interacting with Lavalink.
>
> | Type                          |
> | ----------------------------- |
> | [`Manager`](/classes/manager) |

#### • options

> The object that must be created to connect to a Lavalink server.
>
> | Type                          |
> | ----------------------------- |
> | [`NodeOptions`](#constructor) |

#### • socket

> The socket for the node.
>
> | Type              | Value  |
> | ----------------- | ------ |
> | WebSocket or null | `null` |

#### • stats

> The stats for the node.
>
> | Properties     | Type                                         | Description                                |
> | -------------- | -------------------------------------------- | ------------------------------------------ |
> | cpu            | [`CPUStats`](/typedefs/stats#cpustats)       | The cpu stats for the node.                |
> | frameStats     | [`FrameStats`](/typedefs/stats#framestats)   | The frame stats for the node.              |
> | memory         | [`MemoryStats`](/typedefs/stats#memorystats) | The memory stats for the node.             |
> | players        | `number`                                     | The amount of players on the node.         |
> | playingPlayers | `number`                                     | The amount of playing players on the node. |
> | uptime         | `number`                                     | The uptime for the node.                   |

#### • `get` connected

> Whether the node is connected.
>
> | Type      |
> | --------- |
> | `boolean` |

#### • isEnabled

> Whether the node is enabled.
>
> | Type      |
> | --------- |
> | `boolean` |

### Methods

#### • connect()

> | Description           | Returns |
> | --------------------- | ------- |
> | Connects to the Node. | `void`  |

#### • destroy()

> | Description                                          | Returns |
> | ---------------------------------------------------- | ------- |
> | Destroys the Node and all players connected with it. | `void`  |

#### • setEnabled()

> | Description                   | Returns |
> | ----------------------------- | ------- |
> | Enables or disables the node. | `void`  |
