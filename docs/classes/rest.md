# Rest

Lightweight HTTP client used by Nodes and Players to communicate with Lavalink’s REST API.

### Constructor

```ts
new Rest(node: Node)
```

## Overview

| Methods   | Returns        | Description                          |
| --------- | -------------- | ------------------------------------ |
| `request` | `Promise<any>` | Perform an HTTP request to Lavalink. |

### request()

> Sends an HTTP request to the Lavalink REST API.
>
> Returns: `Promise<unknown>`
>
> | Parameter | Type     | Description                        |
> | --------- | -------- | ---------------------------------- |
> | method    | `Method` | HTTP method (GET, PATCH, POST...). |
> | endpoint  | `string` | API path beginning with `/v4`.     |
> | payload   | `object` | Optional JSON body.                |

### Config

- Uses the node’s `host`, `port`, `secure`, and `password`.
- Default timeout: `Rest.timeout` (ms).
