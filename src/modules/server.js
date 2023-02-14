import http from "http";
import CBot from "../bots/cbot.js";

export default function server(app) {
  app.server = http.createServer(app);

  app.listen(app.config.port, () => {
    console.log("Codyfight bots running on port " + app.config.port);

    const codyfighters = app.config.api.codyfighters;

    codyfighters.forEach((codyfighter, i) => {
      const bot = new CBot(
        app,
        app.config.api.url,
        codyfighter.ckey,
        codyfighter.mode,
        i
      );

      bot.run();
    });
  });
}
