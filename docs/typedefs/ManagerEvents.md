# ManagerEvents

### Overview

| Properties          | value                                                                             |
|---------------------|-----------------------------------------------------------------------------------|
| `nodeConnect`       | `[node: Node]`                                                                    |
| `nodeDestroy`       | `[node: Node]`                                                                    |
| `nodeConnect`       | `[node: Node]`                                                                    |
| `nodeReconnect`     | `[node: Node]`                                                                    |
| `nodeDisconnect`    | `[node: Node, {code?: number, reason?: string}]`                                  |
| `nodeError`         | `[node: Node, error: Error]`                                                      |
| `nodeRaw`           | `[payload: unknown]`                                                              |
| `playerCreate`      | `[player: Player]`                                                                |
| `playerDestroy`     | `[player: Player]`                                                                |
| `playerMove`        | `[player: Player, oldChannel: string, newChannel: string]`                        |
| `playerDisconnect`  | `[player: Player, oldChannel: string]`                                            |
| `queueEnd`          | `[player: Player, track: Track \| UnresolvedTrack, payload: TrackEndEvent]`       |
| `socketClosed`      | `[player: Player, payload: WebSocketClosedEvent]`                                 |
| `trackStart`        | `[player: Player, track: Track, payload: TrackStartEvent]`                        |
| `trackEnd`          | `[player: Player, track, payload; TrackEndEvent]`                                 |
| `trackStuck`        | `[player: Player, track: Track, payload: TrackStuckEvent]`                        |
| `trackError`        | `[player: Player, track: Track \| UnresolvedTrack, payload: TrackExceptionEvent]` |