import dotenv from 'dotenv';

export default function config(app) {
    /** read .env file, parse the contents, assign it to: process.env. */
    dotenv.config();

    app.config = {
        env: process.env.ENV,
        port: process.env.PORT,
        api: {
            codyfight: {
                ckey: process.env.CKEY,
            },
        },
    };
};
