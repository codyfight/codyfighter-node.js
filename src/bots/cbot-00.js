import BaseCBot from './cbot-base.js';

export default class CBot01 extends BaseCBot {

    constructor(app, CKey, mode) {
        super(CKey, mode);
        this.app = app;
    };
};
