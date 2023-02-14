import { TILE_EXIT_GATE } from "../../modules/game-constants.js";

// GameLib class contains all the basic game logic that can be reused by all bots.
// Also contains some helper functions that can be used by the bots.

export default class GameLib {
  distance(x1, y1, x2, y2) {
    const a = x1 - x2;
    const b = y1 - y2;

    return Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));
  }

  findExits(game) {
    return game.map.reduce((exits, row, y) => {
      row.forEach((tile, x) => {
        if (tile.type === TILE_EXIT_GATE) exits.push({ x, y });
      });

      return exits;
    }, []);
  }

  findSpecialAgent(type, game) {
    return game.special_agents.find((agent) => agent.type === type) || null;
  }

  isStaying(move, game) {
    return (
      move.x === game.players.bearer.possible_moves[0].x &&
      move.y === game.players.bearer.possible_moves[0].y
    );
  }

  getRandomMove(game) {
    return game.players.bearer.possible_moves[
      Math.floor(Math.random() * game.players.bearer.possible_moves.length)
    ];
  }

  getRandomTarget(targets) {
    const randomIndex = Math.floor(Math.random() * targets.length);
    return targets[randomIndex];
  }

  getShortestDistanceMove(positions, currentBestMove, game) {
    let shortestDistance = Infinity;

    for (const position of positions) {
      for (const possibleMove of game.players.bearer.possible_moves) {
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

  getFarthestDistanceMove(position, currentBestMove, game) {
    let longestDistance = 0;

    for (const possibleMove of game.players.bearer.possible_moves) {
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
}
