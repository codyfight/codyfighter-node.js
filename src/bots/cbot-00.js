import BaseCBot from './cbot-base.js';

export default class CBot00 extends BaseCBot {

    constructor(app, CKey, mode) {
        super(CKey, mode);
        this.app = app;
    };
};
