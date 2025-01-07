import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { getConfig } from '../services';

const { accessTokenSecret } = getConfig();

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.headers.authorization) {
        res.status(401).send({ message: 'authorization header is missing' });
        return;
    }

    const [bearer, token] = req.headers.authorization?.split(' ');
    if (bearer.toLowerCase() !== 'bearer' || !token) {
        res.status(401).send({ message: 'authorization header is invalid' });
        return;
    }

    jwt.verify(token, accessTokenSecret, async (error, user) => {
        if (error) {
            res.status(401).send({ message: 'token is invalid' });
            return;
        }

        res.locals.user = user;
        next();
    });
};
