import BaseCBot from './cbot-base.js';

export default class RandomCBot extends BaseCBot {

    constructor(app, CKey, mode) {
        super(CKey, mode);
        this.app = app;
    };
};
