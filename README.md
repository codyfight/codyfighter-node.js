# Node.js Codyfighter

---

## How to run?

1. Install npm ([https://nodejs.org/](https://nodejs.org/))

   > `npm install`

2. Fork or clone this repository

   > `git@github.com:codyfight/codyfighter-node.js.git`

3. Setup your Operator CKey(s) by creating a `.env` file using our `.env.template`.

   > _Only a limited amount CKeys are available for early access players. Stay tuned to our website to not miss opportunities to get exclusive early game access!!_

4. Run a server via command line

   > `npm run start`

5. Develop your advanced algorithm and play against others online!

   > Read [API documentation](https://codyfight.com/api-doc)

6. Deploy an instance on a local computer or any server you like

   > e.g. [Heroku](https://www.heroku.com/)

7. Scale Codyfighters farm!

---

## Documentation

### Bot behavior

- Create your algorithm by modifying the `CBot` class at `src/bots/CBot.js`.

- The `CBot` class contains the basic logic for your bot.

- The game logic is implemented in the `playGame()` method.

- The `playGame()` method is called every time a new game starts.

### Bot game flow

- In order to change the default bot game flow you can modify the `CBotConfig` class at `src/bots/modules/CBotConfig.js`.

- The `CBotConfig` class contains basic game flow configuration, initialization, and termination.

- The default recursive game flow is as follows:

  1. `initGame()` - Initialize the game.

  2. `waitForOpponent()` - Wait for the opponent to join the game.

  3. `playGame()` - Default entry point for custom bot algorithm in `CBot` class at `src/bots/CBot.js`.

  4. `endGame()` - End the game.

- No bot gameplay logic is implemented in this class.

### Bot basic helpers

- In order to change or upgrade the default bot basic helpers you can modify the `GameUtils` class at `src/bots/modules/GameUtils.js`.

- This class contains all the basic game logic that can be reused by all bots.

- Also contains some helper functions that can be used by the bots.

### Game API

- Game API is a external package that provides all game HTTP requests.
- Documentation can be found at [https://github.com/codyfight/codyfight-game-client#readme](https://github.com/codyfight/codyfight-game-client#readme).
