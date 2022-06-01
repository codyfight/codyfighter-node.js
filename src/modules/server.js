import http from 'http';
import CBot from '../bots/cbot.js';

export default function server(app) {
    app.server = http.createServer(app);

    app.listen(app.config.port, () => {
        console.log('Codyfight bot server running on port ' + app.config.port);

        /** invoke Codyfighther(s) */

        const CBot_0 = new CBot(app, app.config.api.codyfighter_0.ckey, app.config.api.codyfighter_0.mode);
        CBot_0.run();

        // const CBot_1 = new CBot(app, app.config.api.codyfighter_1.ckey, app.config.api.codyfighter_1.mode);
        // CBot_1.run();
    });
};
