import dotenv from 'dotenv';

export default function config(app) {
    /** read .env file, parse the contents, assign it to: process.env. */
    dotenv.config();

    app.config = {
        port: process.env.PORT,
        api: {
            url: process.env.API_URL,
            codyfighter_0: {
                ckey: process.env.CKEY_0,
                mode: process.env.GAME_MODE_0,
            },
            codyfighter_1: {
                ckey: process.env.CKEY_1,
                mode: process.env.GAME_MODE_1,
            },
        },
    };
};
