import http from "http";
import CBot00 from "../bots/cbot-00.js";

export default function server(app) {
  app.server = http.createServer(app);

  app.listen(app.config.port, () => {
    console.log("Codyfight bots running on port " + app.config.port);

    const CBot_0 = new CBot00(
      app,
      app.config.api.url,
      app.config.api.codyfighter_0.ckey,
      app.config.api.codyfighter_0.mode
    );

    CBot_0.run();
  });
}
