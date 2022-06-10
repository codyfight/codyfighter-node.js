import http from 'http';
import CBot01 from '../bots/cbot-01.js';
import CBot00 from '../bots/cbot-00.js';

export default function server(app) {
    app.server = http.createServer(app);

    app.listen(app.config.port, () => {
        console.log('Codyfight bot server running on port ' + app.config.port);

        /** invoke Codyfighther(s) */

        const CBot_0 = new CBot00(app, app.config.api.codyfighter_0.ckey, app.config.api.codyfighter_0.mode);
        CBot_0.run();

        // TODO: enable the following lines for bot farm scaling
        // const CBot_1 = new CBot01(app, app.config.api.codyfighter_1.ckey, app.config.api.codyfighter_1.mode);
        // CBot_1.run();
    });
};
