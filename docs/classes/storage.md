# Storage

Simple file-based storage implementing the `Database` interface. Used by default for auto-resume when no custom storage is supplied.

### Constructor

```ts
new Storage(clientId: string, shards: number)
```

## Overview

| Methods  | Returns            | Description            |
| -------- | ------------------ | ---------------------- |
| `get`    | `Promise<any>`     | Get a value by key.    |
| `set`    | `Promise<void>`    | Store a value by key.  |
| `delete` | `Promise<boolean>` | Delete a value by key. |

## Database Interface

Any custom storage must implement:

```ts
interface Database {
	set(key: string, data: any): Promise<void> | void;
	get(key: string): Promise<any> | any;
	delete(key: string): Promise<boolean> | boolean;
}
```

### Keys Used

- `sessions.<identifier>` → Lavalink session id (no TTL)
- `players.<guildId>` → Player snapshot used for auto‑resume
