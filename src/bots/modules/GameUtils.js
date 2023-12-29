import { TILE_EXIT, TILE_DEATH_PIT } from "../../modules/game-constants.js";

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
        if (tile.type === TILE_EXIT) exits.push({ x, y });
      });

      return exits;
    }, []);
  }

  findPits(game) {
    return game.map.reduce((pits, row, y) => {
      row.forEach((tile, x) => {
        if (tile.type === TILE_DEATH_PIT) pits.push({ x, y });
      });

      return pits;
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

  isCloser(currentPosition, targetA, targetB) {
    return (
      this.distance(
        currentPosition?.x,
        currentPosition?.y,
        targetA?.x,
        targetA?.y
      ) <
      this.distance(
        currentPosition?.x,
        currentPosition?.y,
        targetB?.x,
        targetB?.y
      )
    );
  }

  getClosestExit(game) {
    const exits = this.findExits(game);
    let distances = [];

    for (const exit of exits) {
      const distance = this.distance(
        game?.players?.bearer?.position?.x,
        game?.players?.bearer?.position?.y,
        exit?.x,
        exit?.y
      );

      distances.push({ exit, distance });
    }

    distances.sort((a, b) => a.distance - b.distance);

    return distances[0]?.exit || null;
  }

  getTargetPosition(possibleTargets, target, towards = true) {
    let distances = [];

    for (const position of possibleTargets) {
      const distance = this.distance(
        position?.x,
        position?.y,
        target?.x,
        target?.y
      );

      distances.push({ position, distance });

      if (towards) distances.sort((a, b) => a.distance - b.distance);
      else distances.sort((a, b) => b.distance - a.distance);
    }

    return distances[0]?.position || null;
  }

  getRandomMove(game) {
    const possibleMoves = game.players.bearer.possible_moves.filter(
      (move) => move.type !== TILE_DEATH_PIT
    );

    return possibleMoves[
      Math.floor(Math.random() * game.players.bearer.possible_moves.length)
    ];
  }

  getRandomTarget(targets) {
    const randomIndex = Math.floor(Math.random() * targets.length);
    return targets[randomIndex];
  }

  getShortestDistanceMove(targets, game) {
    let distances = [];

    const pits = this.findPits(game);

    const possibleMoves = game.players.bearer.possible_moves.filter(
      (position) => {
        if (position?.direction === "stay") return true;

        for (const pit of pits) {
          if (position?.x === pit?.x && position?.y === pit?.y) {
            return false;
          }
        }

        return true;
      }
    );

    for (const position of targets) {
      for (const possibleMove of possibleMoves) {
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

    if (this.isStaying(distances[0]?.move, game)) {
      return this.getRandomMove(game);
    }

    return distances[0]?.move;
  }

  getFarthestDistanceMove(position, game) {
    let longestDistance = 0;
    let move;

    const pits = this.findPits(game);

    const possibleMoves = game.players.bearer.possible_moves.filter(
      (position) => {
        if (position?.direction === "stay") return true;

        for (const pit of pits) {
          if (position?.x === pit?.x && position?.y === pit?.y) {
            return false;
          }
        }

        return true;
      }
    );

    for (const possibleMove of possibleMoves) {
      const distance = this.distance(
        possibleMove?.x,
        possibleMove?.y,
        position?.x,
        position?.y
      );

      if (distance > longestDistance) {
        longestDistance = distance;
        move = possibleMove;
      }
    }

    return move;
  }
}
