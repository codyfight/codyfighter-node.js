import CBotConfig from "./modules/CBotConfig.js";
import GameUtils from "./modules/GameUtils.js";
import { sleep } from "../modules/utils.js";
import { GAME_STATUS_PLAYING } from "../modules/game-constants.js";

// CBot class is the main class for the bot.
// The bot algorithm is implemented in the playGame() method.
// Check the API documentation at https://codyfight.com/api-doc/.

export default class CBot extends CBotConfig {
  constructor(app, url, ckey, mode, i) {
    super(app, url, ckey, mode, i);
    this.gameUtils = new GameUtils();
  }

  // Main game loop
  async playGame() {
    if (!this.game) return await this.run();

    while (this.game.state.status === GAME_STATUS_PLAYING) {
      if (this.game.players.bearer.is_player_turn) {
        // --- Develop your own bot algorithm!
        await this.castSkills();
        await this.makeMove();
        // ---
      } else {
        await sleep(1000);
        this.game = await this.gameAPI.check(this.ckey);
      }
    }
  }

  async makeMove() {
    const move = this.gameUtils.getRandomMove(this.game);

    if (this.game.players.bearer.is_player_turn) {
      this.game = await this.gameAPI.move(this.ckey, move?.x, move?.y);
    }
  }

  async castSkills() {
    if (!this.game?.players?.bearer?.is_player_turn) {
      return;
    }

    for (const skill of this.game.players.bearer.skills) {
      const hasEnoughEnergy =
        skill.cost <= this.game.players.bearer.stats.energy;

      if (
        skill.status !== 1 ||
        skill.possible_targets.length === 0 ||
        !hasEnoughEnergy
      )
        continue;

      const target = this.gameUtils.getRandomTarget(skill.possible_targets);

      this.game = await this.gameAPI.cast(
        this.ckey,
        skill.id,
        target?.x,
        target?.y
      );

      await this.castSkills();
      break;
    }
  }
}
