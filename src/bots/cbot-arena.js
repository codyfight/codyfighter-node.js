import BaseCBot from './cbot-base.js';

export default class ArenaCBot extends BaseCBot {

    constructor(app, CKey, mode) {
        super(CKey, mode);
        this.app = app;
    };
};
