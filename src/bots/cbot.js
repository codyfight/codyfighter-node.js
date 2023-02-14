import BaseCBot from "./modules/BaseCBot.js";
import GameLib from "./modules/GameLib.js";
import { sleep } from "../modules/utils.js";
import { GAME_STATUS_PLAYING } from "../modules/game-constants.js";

// CBot class is the main class for the bot.
// The bot game algorithm is implemented in the playGame() method.

export default class CBot extends BaseCBot {
  constructor(app, url, ckey, mode, i) {
    super(app, url, ckey, mode, i);
    this.gameLib = new GameLib();
  }

  async playGame() {
    while (this.game.state.status === GAME_STATUS_PLAYING) {
      if (this.game.players.bearer.is_player_turn) {
        this.game = await this.castSkills();

        const bestMove = this.determineMove();

        if (this.game.players.bearer.is_player_turn) {
          this.game = await this.gameAPI.move(
            this.ckey,
            bestMove.x,
            bestMove.y
          );

          console.log(
            `>> ${this.game.players.bearer.name} codyfighter moved`,
            bestMove.x,
            bestMove.y
          );
        }
      } else {
        await sleep(1000);

        this.game = await this.gameAPI.check(this.ckey);

        console.log(
          `++ ${this.game.players.bearer.name} game state ${this.game.state.status} received`
        );
      }
    }
  }

  async castSkills() {
    for (const skill of this.game.players.bearer.skills) {
      if (skill.status !== 1 || skill.possible_targets.length === 0) continue;

      const target = this.gameLib.getRandomTarget(skill.possible_targets);

      console.log(
        `>> [PATCH] ${this.game.players.bearer.name} skill ${skill.name} #${skill.id} casted **`
      );

      return await this.gameAPI.cast(this.ckey, skill.id, target.x, target.y);
    }

    return this.game;
  }

  determineMove() {
    let bestMove = this.gameLib.getRandomMove(this.game);

    const exits = this.gameLib.findExits(this.game);
    const ryo = this.gameLib.findSpecialAgent(1, this.game);
    const ripper = this.gameLib.findSpecialAgent(4, this.game);

    // Seek exit
    if (exits.length > 0) {
      bestMove = this.gameLib.getShortestDistanceMove(
        exits,
        bestMove,
        this.game
      );
    }

    // Seek Mr. Ryo instead of standing still
    if (ryo !== null && this.gameLib.isStaying(bestMove, this.game)) {
      bestMove = this.gameLib.getShortestDistanceMove(
        [ryo.position],
        bestMove,
        this.game
      );
      console.log(`>>> ${this.game.players.bearer.name} seeking Mr. Ryo`);
    }

    // Avoid ripper
    if (ripper !== null) {
      console.log(`>< ${this.game.players.bearer.name} avoiding the Ripper!`);

      bestMove = this.gameLib.getFarthestDistanceMove(
        ripper.position,
        bestMove,
        this.game
      );
    }

    // Randomize movement when staying
    if (this.gameLib.isStaying(bestMove, this.game)) {
      bestMove = this.gameLib.getRandomMove(this.game);
    }

    // Add more logic to determine the bestMove!
    // ... cage Mr. Ryo?
    return bestMove;
  }
}
