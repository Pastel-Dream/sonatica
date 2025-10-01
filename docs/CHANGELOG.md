# [1.11.0-next.1](https://github.com/Pastel-Dream/sonatica/compare/v1.10.0...v1.11.0-next.1) (2025-10-01)


### Bug Fixes

* **Lyrics:** fix unsubscribee endpoint ([e44499f](https://github.com/Pastel-Dream/sonatica/commit/e44499f7c3137ef988eaae8a1d39017eccd3e378))
* **Node, Player:** Property 'filter' does not exist ([aeb5e91](https://github.com/Pastel-Dream/sonatica/commit/aeb5e9115591957025e84465059078320a262331))
* **Node:** extend missed operation timeout ([9a6d172](https://github.com/Pastel-Dream/sonatica/commit/9a6d1726cdf9969db2adefadfee278feafc363f5))
* **Node:** fix endpoint ([9dc9790](https://github.com/Pastel-Dream/sonatica/commit/9dc979023721d092e92f43f65ca4eec193ee8069))
* **Node:** prevent unnecessary destruction when not connected ([5f2bbe5](https://github.com/Pastel-Dream/sonatica/commit/5f2bbe5364c77f5c7128f92359d13142b2787b51))
* **Node:** stop ping interval on node destruction ([b22da0f](https://github.com/Pastel-Dream/sonatica/commit/b22da0fd248bb35439c37d011f20437327576263))
* **Node:** stop ping interval on WebSocket close ([c1f0cbe](https://github.com/Pastel-Dream/sonatica/commit/c1f0cbe395ea3b479bd0633dfa094519aec8c834))
* **Sonatica:** replace Collection with Map ([4e209a8](https://github.com/Pastel-Dream/sonatica/commit/4e209a8c6f4a2d4cda7aa28f51c1e735d8b98da9))


### Features

* **Node, Sonatica:** ping mechanism ([de7f1b0](https://github.com/Pastel-Dream/sonatica/commit/de7f1b0cf7fa2f645796f62fd68e2ad49d6ec506))
* **Node, Sonatica:** ping mechanism ([ae33f80](https://github.com/Pastel-Dream/sonatica/commit/ae33f809ffead79297ff7f2513f23aaa2f388d9c))
* **Node:** autoplay handling with fallback video ([df00908](https://github.com/Pastel-Dream/sonatica/commit/df0090887ec126c1b946e68e275623f62efef51a))
* **Node:** event op handler ([38bf639](https://github.com/Pastel-Dream/sonatica/commit/38bf6393778d0d79c9aae2d415bbfb08876b2dcc))
* **Node:** include payload in trackStart and trackEnd events ([6b4faf2](https://github.com/Pastel-Dream/sonatica/commit/6b4faf292cd1c249e0ff4d6b9d8d999d357d4f97))
* **Node:** track last operation timestamp ([043529e](https://github.com/Pastel-Dream/sonatica/commit/043529e36cb0f5e1498f5cc8c537d8cd5765147b))
* **Sonatica, Node, Player:** add tiny-typed-emitter and update event emissions in Node and Player classes ([7b38244](https://github.com/Pastel-Dream/sonatica/commit/7b382443b26dcb02ec88a452ac19d25489a1d75e))
* **Sonatica:** emit playerUpdate event on player state update ([96b4d0c](https://github.com/Pastel-Dream/sonatica/commit/96b4d0cfae7c62ec0323ba6664bbe38badf9b977))

# [1.10.0](https://github.com/Pastel-Dream/sonatica/compare/v1.9.1...v1.10.0) (2025-10-01)


### Features

* **Player:** omit filters when unset; default volume to 100 ([4f077f3](https://github.com/Pastel-Dream/sonatica/commit/4f077f328609b839e90ab6fcbc9489276440145e))

## [1.9.1](https://github.com/Pastel-Dream/sonatica/compare/v1.9.0...v1.9.1) (2025-04-18)


### Bug Fixes

* **types/Sonatica:** fix type in queueEnd event ([95192d6](https://github.com/Pastel-Dream/sonatica/commit/95192d64f5e604c210e13226be8682167278772b))

# [1.9.0](https://github.com/Pastel-Dream/sonatica/compare/v1.8.3...v1.9.0) (2025-04-18)


### Features

* **types/sonatica:** lyrics-related events ([dc53cec](https://github.com/Pastel-Dream/sonatica/commit/dc53cec34082ff80d630b0fac4452e5d64eef397))

## [1.8.3](https://github.com/Pastel-Dream/sonatica/compare/v1.8.2...v1.8.3) (2025-04-15)


### Bug Fixes

* **Node:** ensure trackStart event is emitted correctly ([e318060](https://github.com/Pastel-Dream/sonatica/commit/e3180601b9871a9af812d6947f3f042d4be61527))

## [1.8.2](https://github.com/Pastel-Dream/sonatica/compare/v1.8.1...v1.8.2) (2025-04-15)


### Bug Fixes

* **Node:** improve track resuming logic ([a0aeff4](https://github.com/Pastel-Dream/sonatica/commit/a0aeff412e1c9a7de39741f85c3418588d05e0a4))

## [1.8.1](https://github.com/Pastel-Dream/sonatica/compare/v1.8.0...v1.8.1) (2025-03-30)


### Bug Fixes

* **docs:** fix function name ([7dfb067](https://github.com/Pastel-Dream/sonatica/commit/7dfb06755430c8a06457b095ea4084fedb7c7298))

# [1.8.0](https://github.com/Pastel-Dream/sonatica/compare/v1.7.0...v1.8.0) (2025-03-30)


### Features

* **docs:** add typedefs for Lyrics, RepeatMode, and related events ([1ea23f4](https://github.com/Pastel-Dream/sonatica/commit/1ea23f44cc80d54286150727caa51c22f8509933))
* **Player, Lyrics:** add Lyrics class and integrate with Player for lyrics management ([735857d](https://github.com/Pastel-Dream/sonatica/commit/735857dfb9f1929301334d0bf45474b09f58a05e))

# [1.7.0](https://github.com/Pastel-Dream/sonatica/compare/v1.6.0...v1.7.0) (2025-03-02)


### Features

* **Sonatica:** allow custom database ([57de96e](https://github.com/Pastel-Dream/sonatica/commit/57de96e54b2c37a0d53e435152de688159030bb2))

# [1.6.0](https://github.com/Pastel-Dream/sonatica/compare/v1.5.0...v1.6.0) (2025-01-14)


### Features

* **Node, Player, Op, NodeInfo:** add lyrics handling ([8407f36](https://github.com/Pastel-Dream/sonatica/commit/8407f36c61e7780c46b3b4544baa28d718dd60b1))

# [1.5.0](https://github.com/Pastel-Dream/sonatica/compare/v1.4.5...v1.5.0) (2025-01-14)


### Features

* **Sonatica:** add nodeSwitch event ([d9d9c74](https://github.com/Pastel-Dream/sonatica/commit/d9d9c74ba88f3d7549f2e1b371612b5c3d9701e0))
* **TrackDecoder:** implement custom base64 to ArrayBuffer conversion ([8150ec9](https://github.com/Pastel-Dream/sonatica/commit/8150ec9e3cd7c665daf4e56d1723f6f541500964))

## [1.4.5](https://github.com/Pastel-Dream/sonatica/compare/v1.4.4...v1.4.5) (2025-01-10)


### Bug Fixes

* **Sonatica:** update regex for query validation ([1bc3f89](https://github.com/Pastel-Dream/sonatica/commit/1bc3f8997a1c343db35eef56b5e059a1ae7e21b8))

## [1.4.4](https://github.com/Pastel-Dream/sonatica/compare/v1.4.3...v1.4.4) (2025-01-07)


### Bug Fixes

* **Node:** add optional chaining to prevent runtime errors in player filtering logic ([e7309f9](https://github.com/Pastel-Dream/sonatica/commit/e7309f91fbe4397534f00432e3f8fed62d3ef69d))

## [1.4.3](https://github.com/Pastel-Dream/sonatica/compare/v1.4.2...v1.4.3) (2025-01-05)


### Bug Fixes

* **Player:** add optional chaining to prevent runtime errors in player state updates ([a03d539](https://github.com/Pastel-Dream/sonatica/commit/a03d539068030a8d04f8f02dd16823d78ef43f79))

## [1.4.2](https://github.com/Pastel-Dream/sonatica/compare/v1.4.1...v1.4.2) (2025-01-05)


### Bug Fixes

* **Player:** validate paused parameter and update state management in pause method ([de878b7](https://github.com/Pastel-Dream/sonatica/commit/de878b7d1d26de5be8ac654d6e4460e59f43213b))

## [1.4.1](https://github.com/Pastel-Dream/sonatica/compare/v1.4.0...v1.4.1) (2025-01-05)


### Bug Fixes

* **Player:** improve position fetching logic with fallback options ([538c67e](https://github.com/Pastel-Dream/sonatica/commit/538c67e77666514d18f16351b455db92df7f33a5))

# [1.4.0](https://github.com/Pastel-Dream/sonatica/compare/v1.3.3...v1.4.0) (2025-01-01)


### Features

* **docs:** enhance documentation and structure across multiple classes ([441916d](https://github.com/Pastel-Dream/sonatica/commit/441916d1b486232ded9fc9d3eecc8a3baf33a825))

## [1.3.3](https://github.com/Pastel-Dream/sonatica/compare/v1.3.2...v1.3.3) (2025-01-01)


### Bug Fixes

* **docs, manager:** add missing methods for sending data and sorting nodes ([110dfde](https://github.com/Pastel-Dream/sonatica/commit/110dfde4f8c7b4e28df87a1b5c886035e4410bf7))
