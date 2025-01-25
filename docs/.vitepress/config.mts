import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Sonatica",
  description: "Awesome lavalink wrapper for NodeJS user.",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "Home", link: "/" },
      { text: "Getting started", link: "/getting-started" },
    ],

    sidebar: [
      {
        text: "Introduction",
        items: [{ text: "Getting started", link: "/getting-started" }],
      },
      {
        text: "Classes",
        items: [
          { text: "Sonatica", link: "/classes/sonatica" },
          { text: "Player", link: "/classes/player" },
          { text: "Node", link: "/classes/node" },
          { text: "Queue", link: "/classes/queue" },
          { text: "Filters", link: "/classes/filters" },
        ],
      },
      {
        text: "TypeDefs",
        items: [
          { text: "ManagerEvents", link: "/typedefs/ManagerEvents" },
          { text: "nowPlayingMessage", link: "/typedefs/nowPlayingMessage" },
          { text: "payload", link: "/typedefs/payload" },
          { text: "playOptions", link: "/typedefs/playOptions" },
          { text: "searchResult", link: "/typedefs/searchResult" },
          { text: "stats", link: "/typedefs/stats" },
          { text: "track", link: "/typedefs/track" },
          { text: "trackData", link: "/typedefs/trackData" },
          {
            text: "trackExceptionEvent",
            link: "/typedefs/trackExceptionEvent",
          },
          { text: "trackStartEvent", link: "/typedefs/trackStartEvent" },
          { text: "trackStuckEvent", link: "/typedefs/trackStuckEvent" },
          { text: "unresolvedTrack", link: "/typedefs/unresolvedTrack" },
          { text: "voicePacket", link: "/typedefs/voicePacket" },
          { text: "voiceState", link: "/typedefs/voiceState" },
          {
            text: "webSocketClosedEvent",
            link: "/typedefs/webSocketClosedEvent",
          },
        ],
      },
      {
        text: "Credits",
        items: [
          {
            text: "Erela.JS",
            link: "https://github.com/MenuDocs/erela.js",
          },
          {
            text: "Magmastream",
            link: "https://github.com/Blackfort-Hosting",
          },
          {
            text: "Moonlink.JS",
            link: "https://github.com/Ecliptia/moonlink.js",
          },
        ],
      },
    ],

    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/Pastel-Dream/sonatica",
      },
    ],
  },
});
