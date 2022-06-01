import axios from 'axios';

// TODO: migrate game settings to .env
const GAME_MODE = 2; // 1: custom player; 2 random player; 3 competitive arena
const API_URL = 'https://game.codyfight.com';

// TODO: migrate default constants to game client
const GAME_STATUS_INIT = 0;
const GAME_STATUS_PLAYING = 1;
const GAME_STATUS_TERMINATED = 2;

const TILE_WALL = 0;
const TILE_BLANK = 1;
const TILE_EXIT_GATE = 2;

export default class CBot {

    constructor(app, CKey) {
        this.game = {};
        this.app = app;
        this.CKey = CKey;
    };

    run = async () => {
        do {
            try {
                console.log('*** laucnhing the game...');
                await this.play();
            } catch (e) {
                console.error(`### game failure ###\n*** re-laucnhing the game...`, e);
                await this.run();
            }
        } while (true);
    };

    play = async () => {
        // initialize a new game
        this.game = await this.init(this.CKey, GAME_MODE, null);
        console.log('^^ game initialized', this.game.state);

        // wait for an opponent to match
        while (this.game.state.status === GAME_STATUS_INIT) {
            this.game = await this.check(this.CKey);
            console.log('++ game state received', this.game.state);
        }

        // play the game
        while (this.game.state.status === GAME_STATUS_PLAYING) {
            if (this.game.operators.bearer.is_action_required) {
                let bestMove = this.determineMove(); // TODO: implement determineMove() function to ignite your bot intelligence
                this.game = await this.move(this.CKey, bestMove.x, bestMove.y);
                console.log('>> codyfighter moved', bestMove.x, bestMove.y, this.game.state);
            } else {
                this.game = await this.check(this.CKey);
                console.log('++ game state received', this.game.state);
            }
        }

        // game ended
        if (this.game.state.status === GAME_STATUS_TERMINATED) {
            console.log('!! game terminated !!', this.game.verdict);
        }
    };

    // TODO: implement your advanced algorithm to determine the best movement based on the game state (this.game)
    determineMove = () => {
        const randomMove = Math.floor(Math.random() * this.game.operators.bearer.possible_moves.length);
        let bestMove = this.game.operators.bearer.possible_moves[randomMove];

        const exits = this.findExists();

        let shortestDistance = Infinity;
        for (const exit of exits) {
            for (const possibleMove of this.game.operators.bearer.possible_moves) {
                const distanceToExit = this.distance(possibleMove.x, possibleMove.y, exit.x, exit.y);
                if (distanceToExit < shortestDistance) {
                    shortestDistance = distanceToExit;
                    bestMove = possibleMove;
                }
            }
        }

        // TODO: add more logic to determine the bestMove!
        // ... cage Mr. Ryo?
        return bestMove;
    };

    findExists = () => {
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
            url: API_URL + '?ckey=' + params.ckey,
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
