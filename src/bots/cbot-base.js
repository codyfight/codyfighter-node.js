import GameAPI from "codyfight-game-client";

import {
  GAME_STATUS_INIT,
  GAME_STATUS_PLAYING,
  GAME_STATUS_TERMINATED,
  TILE_EXIT_GATE,
  DELAY_TIMER,
} from "../modules/game-constants.js";

import { sleep } from "../modules/utils.js";

export default class BaseCBot {
  constructor(app, url, ckey, mode) {
    this.app = app;
    this.url = url;
    this.game = {};
    this.ckey = ckey;
    this.mode = mode;
    this.gameAPI = new GameAPI(this.url);
  }

  async run() {
    while (true) {
      try {
        console.log(`*** Launching the game for ${this.constructor.name}...`);
        await this.play();
      } catch (e) {
        console.error(`### Game failure ###`);

        if (e instanceof CustomError) console.error(`Error: ${e.message}`);
        else console.error(`Unexpected error: ${e.stack}`);

        console.error(
          `*** Re-launching the game for ${this.constructor.name}...`
        );

        await sleep(DELAY_TIMER);
        await this.run();
      }
    }
  }

  async initGame() {
    this.game = await this.gameAPI.init(this.ckey, this.mode, null);

    console.log(
      `^^ ${this.url} ${this.game.players.bearer.name} game initialized`,
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

  async endGame() {
    if (this.game.state.status === GAME_STATUS_TERMINATED) {
      console.log(
        `!! ${this.game.players.bearer.name} game terminated!!`,
        this.game.verdict
      );
    }
  }

  async play() {
    try {
      await this.initGame();
      await this.waitForOpponent();
      await this.playGame();
      await this.endGame();
    } catch (error) {
      console.error(`Error in play(): ${error.message}`);
    }
  }

  async castSkills() {
    for (const skill of this.game.players.bearer.skills) {
      if (skill.status !== 1 || skill.possible_targets.length === 0) continue;

      const target = this.getRandomTarget(skill.possible_targets);

      console.log(
        `>> [PATCH] ${this.game.players.bearer.name} skill ${skill.name} #${skill.id} casted **`
      );

      return await this.gameAPI.cast(this.ckey, skill.id, target.x, target.y);
    }

    return this.game;
  }

  getRandomTarget(targets) {
    const randomIndex = Math.floor(Math.random() * targets.length);
    return targets[randomIndex];
  }

  determineMove = () => {
    let bestMove = this.getRandomMove();

    const exits = this.findExits();
    const ryo = this.findSpecialAgent(1);
    const ripper = this.findSpecialAgent(4);

    // seek exit
    if (exits.length > 0) {
      bestMove = this.getShortestDistanceMove(exits, bestMove);
    }

    // seek Mr. Ryo instead of standing still
    if (ryo !== null && this.isStaying(bestMove)) {
      bestMove = this.getShortestDistanceMove([ryo.position], bestMove);
      console.log(`>>> ${this.game.players.bearer.name} seeking Mr. Ryo`);
    }

    // avoid ripper
    if (ripper !== null) {
      console.log(`>< ${this.game.players.bearer.name} avoiding the Ripper!`);
      bestMove = this.getFarthestDistanceMove(ripper.position, bestMove);
    }

    // randomize movement when staying
    if (this.isStaying(bestMove)) {
      bestMove = this.getRandomMove();
    }

    // TODO: add more logic to determine the bestMove!
    // ... cage Mr. Ryo?
    return bestMove;
  };

  getRandomMove() {
    return this.game.players.bearer.possible_moves[
      Math.floor(Math.random() * this.game.players.bearer.possible_moves.length)
    ];
  }

  isStaying(move) {
    return (
      move.x === this.game.players.bearer.possible_moves[0].x &&
      move.y === this.game.players.bearer.possible_moves[0].y
    );
  }

  getShortestDistanceMove(positions, currentBestMove) {
    let shortestDistance = Infinity;

    for (const position of positions) {
      for (const possibleMove of this.game.players.bearer.possible_moves) {
        const distance = this.distance(
          possibleMove.x,
          possibleMove.y,
          position.x,
          position.y
        );

        if (distance < shortestDistance) {
          shortestDistance = distance;
          currentBestMove = possibleMove;
        }
      }
    }

    return currentBestMove;
  }

  getFarthestDistanceMove(position, currentBestMove) {
    let longestDistance = 0;

    for (const possibleMove of this.game.players.bearer.possible_moves) {
      const distance = this.distance(
        possibleMove.x,
        possibleMove.y,
        position.x,
        position.y
      );

      if (distance > longestDistance) {
        longestDistance = distance;
        currentBestMove = possibleMove;
      }
    }

    return currentBestMove;
  }

  findExits() {
    return this.game.map.reduce((exits, row, y) => {
      row.forEach((tile, x) => {
        if (tile.type === TILE_EXIT_GATE) exits.push({ x, y });
      });

      return exits;
    }, []);
  }

  findSpecialAgent(type) {
    return (
      this.game.special_agents.find((agent) => agent.type === type) || null
    );
  }

  distance(x1, y1, x2, y2) {
    const a = x1 - x2;
    const b = y1 - y2;

    return Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));
  }
}
