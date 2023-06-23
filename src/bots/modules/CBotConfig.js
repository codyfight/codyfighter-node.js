import GameAPI from "codyfight-game-client";
import log from "../../utils/logger.js";

import {
  DELAY_TIMER,
  GAME_STATUS_INIT,
  GAME_STATUS_PLAYING,
  GAME_STATUS_TERMINATED,
} from "../../modules/game-constants.js";

import { sleep } from "../../modules/utils.js";

// Base Codyfighter bot Class for basic game flow configuration, initialization, and termination.
// No bot game algorithm is implemented in this class.

export default class CBotConfig {
  constructor(app, url, ckey, mode, i) {
    this.app = app;
    this.url = url;
    this.index = i;
    this.game = {};
    this.ckey = ckey;
    this.mode = mode;
    this.gameAPI = new GameAPI(url);
  }

  getBotName() {
    return `${this.constructor.name}_${this.index}`;
  }

  getGameStatus() {
    const opponent = this.game.players.opponent.name;
    const gameStates = {
      [GAME_STATUS_INIT]: "is waiting for opponent",
      [GAME_STATUS_TERMINATED]: "game terminated",
      [GAME_STATUS_PLAYING]: `is playing ${
        opponent ? `against ${opponent.toUpperCase()}` : ""
      }`,
    };

    return gameStates[this.game.state.status];
  }

  async run() {
    while (true) {
      try {
        log(`${this.getBotName()}: Launching the game`, "info");

        await this.play();
      } catch (error) {
        log(
          `${this.getBotName()}: ${JSON.stringify(
            {
              message: error?.message,
              method: error?.config?.method,
              url: error?.config?.url,
              code: error?.code,
              data: error?.config?.data
                ? JSON.parse(error?.config?.data, null, 2)
                : null,
            },
            null,
            2
          )}`,
          "error"
        );

        log(`${this.getBotName()}: Re-launching the game`, "info");

        await sleep(DELAY_TIMER);
        await this.run();
      }
    }
  }

  async play() {
    try {
      await this.initGame();
      await this.waitForOpponent();

      // Custom game algorithm on the child class src/bots/CBot.js:17
      await this.playGame();

      await this.endGame();
    } catch (error) {
      log(
        `${this.getBotName()}: ${JSON.stringify(
          {
            message: error?.message,
            method: error?.config?.method,
            url: error?.config?.url,
            code: error?.code,
            data: error?.config?.data
              ? JSON.parse(error?.config?.data, null, 2)
              : null,
          },
          null,
          2
        )}`,
        "error"
      );
    }
  }

  async initGame() {
    this.game = await this.gameAPI.init(this.ckey, this.mode, null);

    const name = this.game.players.bearer.name;
    const dashboardUrl = this.url.replace("game.", "").replace("game-", "");

    log(
      `${this.getBotName()}: ${name.toUpperCase()} ${this.getGameStatus()}. Spectate at ${dashboardUrl}play/?spectate=${name}`,
      "info"
    );
  }

  async waitForOpponent() {
    while (this.game.state.status === GAME_STATUS_INIT) {
      await sleep(1000);

      this.game = await this.gameAPI.check(this.ckey);

      const name = this.game.players.bearer.name;
      const dashboardUrl = this.url.replace("game.", "").replace("game-", "");
      const isPlaying = this.game.state.status === GAME_STATUS_PLAYING;
      const spectate = `Spectate at ${dashboardUrl}play/?spectate=${name}`;

      log(
        `${this.getBotName()}: ${this.game.players.bearer.name.toUpperCase()} ${this.getGameStatus()} ${
          isPlaying ? spectate : ""
        }`,
        "info"
      );
    }
  }

  async endGame() {
    if (this.game.state.status === GAME_STATUS_TERMINATED) {
      const player = this.game.players.bearer.name;

      const getVerdict = (verdict) => {
        switch (verdict.winner) {
          case null:
            return "draw";
          case this.game.players.opponent.name:
            return "lost";
          case player:
            return "win";

          default:
            return "draw";
        }
      };

      log(
        `${this.getBotName()}: ${player.toUpperCase()} game ended!
${JSON.stringify(this.game.verdict, null, 2)}`,
        getVerdict(this.game.verdict)
      );
    }
  }
}
