import GameAPI from "codyfight-game-client";

import {
  GAME_STATUS_INIT,
  GAME_STATUS_PLAYING,
  GAME_STATUS_TERMINATED,
  TILE_EXIT_GATE,
  DELAY_TIMER,
} from "../modules/game-constants.js";

export default class BaseCBot {
  constructor(app, url, ckey, mode) {
    this.app = app;
    this.url = url;
    this.game = {};
    this.ckey = ckey;
    this.mode = mode;
    this.gameAPI = new GameAPI(this.url);
  }

  run = async () => {
    do {
      try {
        console.log(`*** launching the game for ${this.constructor.name}...`);

        await this.play();
      } catch (e) {
        console.error(
          `### game failure ###\n*** re-launching the game for ${this.constructor.name}...`
        );

        if (e.data !== undefined) {
          console.error(e.data);
        } else if (e.response !== undefined && e.response.data !== undefined) {
          console.error(e.response.data);
        } else {
          // TODO: handle fatal: send error to the discord channel (?)
          console.error(e);
        }

        await this.app.sleep(DELAY_TIMER);
        await this.run();
      }
    } while (true);
  };

  play = async () => {
    // initialize a new game
    this.game = await this.gameAPI.init(this.ckey, this.mode, null);

    console.log(
      `^^ ${this.url} ${this.game.players.bearer.name} game initialized`,
      this.game.state
    );

    // wait for an opponent to match
    while (this.game.state.status === GAME_STATUS_INIT) {
      this.game = await this.gameAPI.check(this.ckey);

      console.log(
        `++ ${this.game.players.bearer.name} game state ${this.game.state.status} received`
      );
    }

    // play the game
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
        this.game = await this.gameAPI.check(this.ckey);

        console.log(
          `++ ${this.game.players.bearer.name} game state ${this.game.state.status} received`
        );
      }
    }

    // game ended
    if (this.game.state.status === GAME_STATUS_TERMINATED) {
      console.log(
        `!! ${this.game.players.bearer.name} game terminated !!`,
        this.game.verdict
      );
    }
  };

  castSkills = async () => {
    for (const skill of this.game.players.bearer.skills) {
      if (skill.status !== 1 || skill.possible_targets.length === 0) {
        continue;
      }

      const random = Math.floor(Math.random() * skill.possible_targets.length);
      const targetX = skill.possible_targets[random].x;
      const targetY = skill.possible_targets[random].y;

      console.log(
        `>> [PATCH] ${this.game.players.bearer.name} skill ${skill.name} #${skill.id} casted **`
      );

      return await this.gameAPI.cast(this.ckey, skill.id, targetX, targetY);
    }

    return this.game;
  };

  determineMove = () => {
    // randomize movement
    let bestMove =
      this.game.players.bearer.possible_moves[
        Math.floor(
          Math.random() * this.game.players.bearer.possible_moves.length
        ) // pick any random possible move
      ];

    // seek exit
    let shortestDistance = Infinity;

    for (const exit of this.findExits()) {
      for (const possibleMove of this.game.players.bearer.possible_moves) {
        const distanceToExit = this.distance(
          possibleMove.x,
          possibleMove.y,
          exit.x,
          exit.y
        );

        if (distanceToExit < shortestDistance) {
          shortestDistance = distanceToExit;
          bestMove = possibleMove;
        }
      }
    }

    // seek Mr. Ryo instead of standing still
    const ryo = this.findSpecialAgent(1); // TODO: const for Mr. Ryo

    if (
      ryo !== null &&
      bestMove.x === this.game.players.bearer.possible_moves[0].x &&
      bestMove.y === this.game.players.bearer.possible_moves[0].y // stay
    ) {
      let shortestDistance = Infinity;

      console.log(`>>> ${this.game.players.bearer.name} seeking Mr. Ryo`);

      for (const possibleMove of this.game.players.bearer.possible_moves) {
        const distanceToRyo = this.distance(
          possibleMove.x,
          possibleMove.y,
          ryo.position.x,
          ryo.position.y
        );

        if (distanceToRyo < shortestDistance) {
          shortestDistance = distanceToRyo;
          bestMove = possibleMove;
        }
      }
    }

    // randomize movement when staying
    if (
      bestMove.x === this.game.players.bearer.possible_moves[0].x &&
      bestMove.y === this.game.players.bearer.possible_moves[0].y
    ) {
      bestMove =
        this.game.players.bearer.possible_moves[
          Math.floor(
            Math.random() * this.game.players.bearer.possible_moves.length
          ) // pick any random possible move
        ];
    }

    // avoid ripper
    const ripper = this.findSpecialAgent(4); // TODO: const Ripper ID

    if (ripper !== null) {
      console.log(`>< ${this.game.players.bearer.name} avoiding the Ripper!`);

      let longestDistance = 0;

      for (const possibleMove of this.game.players.bearer.possible_moves) {
        const distanceToRipper = this.distance(
          possibleMove.x,
          possibleMove.y,
          ripper.position.x,
          ripper.position.y
        );

        if (distanceToRipper > longestDistance) {
          longestDistance = distanceToRipper;
          bestMove = possibleMove;
        }
      }
    }

    // TODO: add more logic to determine the bestMove!
    // ... cage Mr. Ryo?
    return bestMove;
  };

  findExits = () => {
    const exits = [];

    for (let y in this.game.map) {
      for (let x in this.game.map[y]) {
        if (this.game.map[y][x].type === TILE_EXIT_GATE) {
          exits.push({ x, y });
        }
      }
    }

    return exits;
  };

  findSpecialAgent = (type) => {
    for (const agent of this.game.special_agents) {
      if (agent.type === type) {
        return agent;
      }
    }

    return null;
  };

  distance = (x1, y1, x2, y2) => {
    const a = x1 - x2;
    const b = y1 - y2;

    return Math.sqrt(a * a + b * b);
  };
}
