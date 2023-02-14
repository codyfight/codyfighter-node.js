import dotenv from "dotenv";

import { codyfighterVariables } from "./utils.js";

export default function config(app) {
  dotenv.config();

  app.config = {
    port: process.env.PORT,
    api: {
      url: process.env.API_URL,
      codyfighters: codyfighterVariables(process.env),
    },
  };
}
