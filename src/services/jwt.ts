import jwt from 'jsonwebtoken';
import { getConfig } from './config';

const { accessTokenSecret, tokenExpiration } = getConfig();

export const createToken = (payload: Record<string, any>) =>
    jwt.sign(payload, accessTokenSecret, { expiresIn: tokenExpiration });
