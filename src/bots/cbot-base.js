import axios from 'axios';

// TODO: migrate default constants to game client
const GAME_STATUS_INIT = 0;
const GAME_STATUS_PLAYING = 1;
const GAME_STATUS_TERMINATED = 2;

const TILE_WALL = 0;
const TILE_BLANK = 1;
const TILE_EXIT_GATE = 2;

export default class BaseCBot {

    constructor(CKey, mode) {
        this.game = {};
        this.CKey = CKey;
        this.mode = mode;
    };

    run = async () => {
        do {
            try {
                console.log(`*** launching the game for ${ this.constructor.name }...`);
                await this.play();
            } catch (e) {
                console.error(`### game failure ###\n*** re-launching the game for ${ this.constructor.name }...`, e);
            }
        } while (true);
    };

    play = async () => {
        // initialize a new game
        this.game = await this.init(this.CKey, this.mode, null);
        console.log('^^ game initialized', this.game.state);

        // wait for an opponent to match
        while (this.game.state.status === GAME_STATUS_INIT) {
            this.game = await this.check(this.CKey);
            console.log('++ game state received', this.game.state.status);
        }

        // play the game
        while (this.game.state.status === GAME_STATUS_PLAYING) {
            if (this.game.players.bearer.is_player_turn) {
                const bestMove = this.determineMove(); // TODO: implement determineMove() function to ignite your bot intelligence
                this.game = await this.move(this.CKey, bestMove.x, bestMove.y);
                console.log('>> codyfighter moved', bestMove.x, bestMove.y, this.game.state.status);
            } else {
                this.game = await this.check(this.CKey);
                console.log('++ game state received', this.game.state.status);
            }
        }

        // game ended
        if (this.game.state.status === GAME_STATUS_TERMINATED) {
            console.log('!! game terminated !!', this.game.verdict);
        }
    };

    // TODO: implement your advanced algorithm to determine the best movement based on the game state (this.game)
    determineMove = () => {
        let bestMove = this.game.players.bearer.possible_moves[
            Math.floor(Math.random() * this.game.players.bearer.possible_moves.length) // pick any random possible move
        ];

        for (const exit of this.findExits()) {
            const moveTowardsExit = this.getMoveTowards(exit);
            if (moveTowardsExit !== null) {
                bestMove = moveTowardsExit;
            }
        }

        // TODO: add more logic to determine the bestMove! e.g. cage Mr. Ryo? avoid the Ripper?
        return bestMove;
    };

    getMoveTowards = (position) => {
        let bestMove = null;
        let shortestDistance = Infinity;

        for (const possibleMove of this.game.players.bearer.possible_moves) {
            const distanceToExit = this.distance(possibleMove.x, possibleMove.y, position.x, position.y);
            if (distanceToExit < shortestDistance) {
                shortestDistance = distanceToExit;
                bestMove = possibleMove;
            }
        }

        return bestMove;
    };

    findExits = () => {
        const exits = [];
        for (let y in this.game.map) {
            for (let x in this.game.map[y]) {
                if (this.game.map[y][x] === TILE_EXIT_GATE) {
                    exits.push({x, y});
                }
            }
        }

        return exits;
    };

    distance = (x1, y1, x2, y2) => {
        const a = x1 - x2;
        const b = y1 - y2;

        return Math.sqrt(a * a + b * b);
    };

    // TODO: migrate to node.js client package
    init = async (CKey, mode, opponent) => {
        return await this.request('POST', { 'ckey': CKey, 'mode': mode, 'opponent': opponent });
    };
    
    move = async (CKey, x, y) => {
        return await this.request('PUT', { 'ckey': CKey, 'x': x, 'y': y });
    };
    
    check = async (CKey) => {
        return await this.request('GET', { 'ckey': CKey });
    };
    
    request = async (method, params) => {
        let config = {
            url: this.app.config.api.url + '?ckey=' + params.ckey,
            method: method,
            headers: { 'Content-Type': 'application/json' },
        };
    
        if (!(method === 'GET' || method === 'HEAD')) {
            config.data = params;
        }
    
        let response = await axios(config);

        return response.data;
    };
    //
};
