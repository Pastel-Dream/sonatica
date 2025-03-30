# Player

### Constructor

```ts
new Player(options: PlayerOptions)
```

## Properties

| Options        | Type      | Description                              |
| -------------- | :-------- | ---------------------------------------- |
| `guild`        | `string`  | The guild the Player belongs to.         |
| `node`         | `string`  | The node the Player uses.                |
| `selfDeafen`   | `boolean` | If the player should deaf itself.        |
| `selfMute`     | `boolean` | If the player should mute itself.        |
| `textChannel`  | `string`  | The text channel the Player belongs to.  |
| `voiceChannel` | `string`  | The voice channel the Player belongs to. |
| `volume`       | `number`  | The initial volume the Player will use.  |
| `data`         | `object`  | Additional data for the player.          |

## Overview

| Properties                      | Methods                               |
| ------------------------------- | ------------------------------------- |
| [isAutoplay](#•-isautoplay)     | [connect](#•-connect)                 |
| [filters](#•-filters)           | [destroy](#•-destroy)                 |
| [guild](#•-guild)               | [disconnect](#•-disconnect)           |
| [sonatica](#•-sonatica)         | [get](#•-get)                         |
| [node](#•-node)                 | [pause](#•-pause)                     |
| [lyrics](#•-lyrics)             | [previous](#•-previous)               |
| [options](#•-options)           | [skip](#•-skip)                       |
| [paused](#•-paused)             | [search](#•-search)                   |
| [playing](#•-playing)           | [seek](#•-seek)                       |
| [position](#•-position)         | [set](#•-set)                         |
| [queue](#•-queue)               | [setRepeatMode](#•-setRepeatMode)     |
| [repeatMode](#•-repeatmode)     | [setTextChannel](#•-settextchannel)   |
| [state](#•-state)               | [setVoiceChannel](#•-setvoicechannel) |
| [textChannel](#•-textchannel)   | [setVolume](#•-setvolume)             |
| [voiceChannel](#•-voicechannel) | [setAutoplay](#•-setautoplay)         |
| [voiceState](#•-voicestate)     | [moveNode](#•-moveNode)               |
| [volume](#•-volume)             | [stop](#•-stop)                       |
|                                 | [play](#•-play)                       |

### Properties

#### • filters

> The filters instance.
>
> | Type                          |
> | ----------------------------- |
> | [Filters](../classes/filters) |

#### • guild

> The guild of the player.
>
> | Type   |
> | ------ |
> | string |

#### • sonatica

> The main hub for interacting with Lavalink.
>
> | Type                            |
> | ------------------------------- |
> | [Sonatica](../classes/sonatica) |

#### • node

> The node which the player is currently using.
>
> | Type                    |
> | ----------------------- |
> | [Node](../classes/node) |

#### • lyrics

> The lyrics object associated with the player.
>
> | Type                        |
> | --------------------------- |
> | [Lyrics](../classes/lyrics) |

#### • options

> | Type                          |
> | ----------------------------- |
> | [PlayerOptions](#constructor) |

#### • paused

> Whether the player is paused.
>
> | Type    | Value |
> | ------- | ----- |
> | boolean | false |

#### • playing

> Whether the player is playing.
>
> | Type    | Value |
> | ------- | ----- |
> | boolean | false |

#### • postition

> The current track time.
>
> | Type    | Value |
> | ------- | ----- |
> | boolean | false |

#### • queue

> The player's queue.
>
> | Type                      |
> | ------------------------- |
> | [Queue](../classes/queue) |

#### • repeatMode

> The repeat mode of the player.
>
> | Type                                    | Value |
> | --------------------------------------- | ----- |
> | [RepeatMode](../typedefs/RepeatMode.md) | 0     |

#### • state

> The current state of the player.
>
> | Types                                                                                    |
> | ---------------------------------------------------------------------------------------- |
> | `CONNECTED` `CONNECTING` `DISCONNECTED` `DISCONNECTING` `DESTROYING` `MOVING` `RESUMING` |

#### • textChannel

> The text channel which the player uses.
>
> | Type   | Value |
> | ------ | ----- |
> | string | null  |

#### • trackRepeat

> Whether the player repeats the track.
>
> | Type    | Value |
> | ------- | ----- |
> | boolean | false |

#### • voiceChannel

> The voice channel which the player uses.
>
> | Type   | Value |
> | ------ | ----- |
> | string | null  |

#### • voiceState

> Discord's voice state object.
>
> | Type                                 |
> | ------------------------------------ |
> | [VoiceState](../typedefs/voiceState) |

#### • volume

> The volume level of the player.
>
> | Type   |
> | ------ |
> | number |

#### • isAutoplay

> Whether the player is in autoplay mode.
>
> | Type    |
> | ------- |
> | boolean |

### Methods

#### • connect()

> | Description                   | Returns |
> | ----------------------------- | ------- |
> | Connect to the voice channel. | `this`  |

#### • destroy()

> | Description          | Returns |
> | -------------------- | ------- |
> | Destroys the player. | `void`  |

#### • disconnect()

> | Description                        | Returns |
> | ---------------------------------- | ------- |
> | Disconnect from the voice channel. | `this`  |

#### • moveNode()

> Moves the player to a different node.
>
> Returns: `this`
>
> | Parameter | Type   |
> | --------- | ------ |
> | node      | string |

#### • get()

> Get custom data.
>
> Type parameter `T`
>
> Returns: `T`
>
> | Parameter | Type   |
> | --------- | ------ |
> | key       | string |

#### • pause()

> Pauses the current track.
>
> Returns: `this`
>
> | Parameter | Type    |
> | --------- | ------- |
> | pause     | boolean |

#### • previous()

> | Description                   | Returns |
> | ----------------------------- | ------- |
> | Go back to the previous song. | `this`  |

#### • play()

> Plays the next track.
>
> Returns: `Promise<void>`

#### • play()

> Returns: `Promise<void>`
>
> | Parameter | Type                       | Description                |
> | --------- | -------------------------- | -------------------------- |
> | track     | [Track](../typedefs/track) | Plays the specified track. |

#### • search()

> Same as `Sonatica#search()` but a shortcut on the player itself.
>
> Returns: Promise<[SearchResult](../typedefs/searchResult)>
>
> | Parameter | Type    |
> | --------- | ------- |
> | query     | string  |
> | requester | unknown |

#### • seek()

> Seeks to the position in the current track.
>
> Returns: `this`
>
> | Parameter | Type   |
> | --------- | ------ |
> | position  | number |

#### • set()

> Set custom data.
>
> Returns: `void`
>
> | Parameter | Type    |
> | --------- | ------- |
> | key       | string  |
> | value     | unknown |

#### • setRepeat()

> Sets the repeat mode
>
> Returns: `this`
>
> | Parameter | Type                                 |
> | --------- | ------------------------------------ |
> | mode      | [RepeatMode](../typedefs/RepeatMode) |

#### • setTextChannel()

> Sets the player text channel.
>
> Returns: `this`
>
> | Parameter | Type   |
> | --------- | ------ |
> | channel   | string |

#### • setVoiceChannel()

> Sets the player voice channel.
>
> Returns: `this`
>
> | Parameter | Type   |
> | --------- | ------ |
> | channel   | string |

#### • setVolume()

> Sets the player volume.
>
> Returns: `this`
>
> | Parameter | Type   |
> | --------- | ------ |
> | volume    | number |

#### • setAutoplay()

> Sets the autoplay state.
>
> Returns: `this`
>
> | Parameter | Type    |
> | --------- | ------- |
> | state     | boolean |

#### • stop()

> | Description              | Returns |
> | ------------------------ | ------- |
> | Stops the current track. | `this`  |

#### • skip()

> | Description              | Returns |
> | ------------------------ | ------- |
> | Skips the current track. | `this`  |
