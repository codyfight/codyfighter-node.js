import axios from 'axios';

// game settings
const GAME_MODE = 2; // 1: custom player; 2 random player; 3 competitive arena
const API_URL = 'https://game.codyfight.com';

// default constants
const GAME_STATUS_INIT = 0;
const GAME_STATUS_PLAYING = 1;
const GAME_STATUS_TERMINATED = 2;

export default class CBot {

    constructor(app) {
        this.app = app;

        this.CKey = this.app.config.api.codyfight.ckey;
        this.game = {};
    }

    run = async () => {

        do {
            try {
                console.log('* laucnhing the game...');
                await this.play();
            } catch (e) {
                console.error(`#### game failure ####\n* re-laucnhing the game...`, e);
                await this.run();
            }
        } while (true);
    };

    play = async () => {
        // initialize a new game
        this.game = await this.init(this.CKey, GAME_MODE, null);
        console.log('^^ game initialized', this.game.state);

        // wait an opponent match
        while (this.game.state.status === GAME_STATUS_INIT) {
            this.game = await this.check(this.CKey);
            console.log('++ Game state received', this.game.state);
        }

        // play the game
        while (this.game.state.status === GAME_STATUS_PLAYING) {
            if (this.game.operators.bearer.is_action_required) {
                // TODO: implement smart solution here instead of random movement
                let randomMove = Math.floor(Math.random() * this.game.operators.bearer.possible_moves.length);
                let x = this.game.operators.bearer.possible_moves[randomMove].x;
                let y = this.game.operators.bearer.possible_moves[randomMove].y;

                this.game = await this.move(this.CKey, x, y);
                console.log('>> codyfighter moved', x, y, this.game.state);
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

    // TODO: migrate to node.js client package
    init = async (CKey, mode, opponent) => {
        return await this.request('POST', { 'ckey': CKey, 'mode': mode, 'opponent': opponent });
    }
    
    move = async (CKey, x, y) => {
        return await this.request('PUT', { 'ckey': CKey, 'x': x, 'y': y });
    }
    
    check = async (CKey) => {
        return await this.request('GET', { 'ckey': CKey });
    }
    
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
    }
    //
};