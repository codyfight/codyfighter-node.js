import GameAPI from "codyfight-game-client";

import {
  DELAY_TIMER,
  GAME_STATUS_INIT,
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

  async run() {
    while (true) {
      try {
        console.log(
          `*** Launching the game for ${this.constructor.name}_${this.index}`
        );

        await this.play();
      } catch (e) {
        console.error(`### Game failure ### Error: ${e.message}`);

        console.log(
          `*** Re-launching the game for ${this.constructor.name}_${this.index}`
        );

        await sleep(DELAY_TIMER);
        await this.run();
      }
    }
  }

  async play() {
    try {
      await this.initGame();
      await this.waitForOpponent();

      // Custom game algorithm on the child class
      await this.playGame();

      await this.endGame();
    } catch (error) {
      console.error(`Error in play(): ${error.message}`);
    }
  }

  async initGame() {
    this.game = await this.gameAPI.init(this.ckey, this.mode, null);

    const dashboardUrl = this.url.replace("game.", "").replace("game-", "");

    console.log(
      `^^ ${this.url} ${this.game.players.bearer.name} game initialized.
Spectate your bot at ${dashboardUrl}play/?spectate=${this.game.players.bearer.name}
`,
      this.game.state
    );
  }

  async waitForOpponent() {
    while (this.game.state.status === GAME_STATUS_INIT) {
      await sleep(1000);

      this.game = await this.gameAPI.check(this.ckey);

      console.log(
        `++ ${this.game.players.bearer.name} game state ${this.game.state.status} received`
      );
    }
  }

  async endGame() {
    if (this.game.state.status === GAME_STATUS_TERMINATED) {
      console.log(
        `!! ${this.game.players.bearer.name} game terminated!!`,
        this.game.verdict
      );
    }
  }
}
