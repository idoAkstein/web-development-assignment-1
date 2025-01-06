import { config as configDotenv } from 'dotenv';
import { Config } from '../types';

const REQUIRED_ENVIRONMENT_VARIABLES = [
    'DATABASE_URL',
    'ACCESS_TOKEN_SECRET',
    'REFRESH_TOKEN_SECRET',
    'TOKEN_EXPIRATION',
    'REFRESH_TOKEN_EXPIRATION',
];

const checkEnvironmentVariables = () => {
    if (REQUIRED_ENVIRONMENT_VARIABLES.some((variable) => !(variable in process.env))) {
        const missingVariables = REQUIRED_ENVIRONMENT_VARIABLES.find((variable) => !(variable in process.env));
        throw new Error(`missing environment variable: ${missingVariables}`);
    }
};

let config: Config;

export const getConfig = () => {
    if (!config) {
        configDotenv();
        checkEnvironmentVariables();

        const { env } = process as { env: Record<string, string> };

        config = {
            databaseURL: env.DATABASE_URL,
            accessTokenSecret: env.ACCESS_TOKEN_SECRET,
            accessTokenExpiration: env.TOKEN_EXPIRATION,
            refreshTokenSecret: env.REFRESH_TOKEN_SECRET,
            refreshTokenExpiration: env.REFRESH_TOKEN_EXPIRATION,
            port: Number(env.PORT) || 8080,
        };
    }

    return config;
};
