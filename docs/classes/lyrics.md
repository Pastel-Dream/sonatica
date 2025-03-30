# Lyrics

## Overview

| Properties          | Methods                       |
| ------------------- | ----------------------------- |
| [node](#•-node)     | [get](#•-get)                 |
| [player](#•-player) | [subscribe](#•-subscribe)     |
|                     | [unsubscribe](#•-unsubscribe) |

## Properties

#### • node

> The node instance associated with the player.
>
> | Type                    | Value       |
> | ----------------------- | :---------- |
> | [Node](../classes/node) | player.node |

#### • player

> The player instance associated with this lyrics handler.
>
> | Type                        |
> | --------------------------- |
> | [Player](../classes/player) |

## Methods

#### • get()

> Retrieves lyrics for the currently playing track.
>
> Returns: `Promise<LyricsResult>`
>
> Throws: `RangeError` - If the LavaLyrics plugin is not installed.
>
> | Parameter                  | type    | Default |
> | -------------------------- | ------- | ------- |
> | `Optional` skipTrackSource | boolean | false   |

#### • subscribe()

> Subscribes to lyrics updates for the current player.
>
> Returns: `Promise<unknown>`
>
> Throws: `RangeError` - If the LavaLyrics plugin is not installed.

#### • unsubscribe()

> Unsubscribes from lyrics updates for the current player.
>
> Returns: `Promise<unknown>`
>
> Throws: `RangeError` - If the LavaLyrics plugin is not installed.
