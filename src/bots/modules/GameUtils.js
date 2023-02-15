import { TILE_EXIT_GATE } from "../../modules/game-constants.js";

// GameUtils class contains all the basic game logic that can be reused by all bots.
// Also contains some helper functions that can be used by the bots.

export default class GameUtils {
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

  findTileByPosition(x, y, game) {
    return game.map[y][x];
  }

  findSpecialAgent(type, game) {
    return game.special_agents.find((agent) => agent.type === type) || null;
  }

  isStaying(move, game) {
    return (
      move?.x === game.players.bearer.possible_moves[0]?.x &&
      move?.y === game.players.bearer.possible_moves[0]?.y
    );
  }

  isNearby(position, specialAgentPosition, distance = 1) {
    return (
      this.distance(
        position?.x,
        position?.y,
        specialAgentPosition?.x,
        specialAgentPosition?.y
      ) <= distance
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

  getShortestDistanceMove(targets, game) {
    let distances = [];

    for (const position of targets) {
      for (const possibleMove of game.players.bearer.possible_moves) {
        const distance = this.distance(
          possibleMove?.x,
          possibleMove?.y,
          position?.x,
          position?.y
        );

        distances.push({ move: possibleMove, distance });
      }
    }

    distances.sort((a, b) => a.distance - b.distance);

    if (this.isStaying(distances[0].move, game)) {
      return this.getRandomMove(game);
    }

    return distances[0].move;
  }

  getFarthestDistanceMove(position, currentBestMove, game) {
    let longestDistance = 0;

    for (const possibleMove of game.players.bearer.possible_moves) {
      const distance = this.distance(
        possibleMove?.x,
        possibleMove?.y,
        position?.x,
        position?.y
      );

      if (distance > longestDistance) {
        longestDistance = distance;
        currentBestMove = possibleMove;
      }
    }

    return currentBestMove;
  }
}
