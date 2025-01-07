import jwt from 'jsonwebtoken';
import { Document, Types } from 'mongoose';
import { getUserById } from '../dal';
import { User } from '../models';
import { getConfig } from './config';

const config = getConfig();

export const createTokens = (payload: Record<string, any>) => {
    const random = Math.random().toString();
    const newPayload = { ...payload, random };

    return {
        accessToken: createToken(newPayload, 'access'),
        refreshToken: createToken(newPayload, 'refresh'),
    };
};

const createToken = (payload: Record<string, any>, type: 'access' | 'refresh') =>
    jwt.sign(payload, config[`${type}TokenSecret`], { expiresIn: config[`${type}TokenExpiration`] });

export const verifyRefreshToken = (refreshToken?: string) => {
    return new Promise<(Document<unknown, {}, User> & User & { _id: Types.ObjectId }) | undefined>(
        (resolve, reject) => {
            if (!refreshToken) {
                reject();
                return;
            }

            jwt.verify(refreshToken, config.refreshTokenSecret, async (error, payload) => {
                if (error || !payload) {
                    reject();
                    return;
                }

                const { _id: userId } = payload as { _id: string };
                try {
                    const user = await getUserById(userId);
                    if (!user) {
                        reject();
                        return;
                    }

                    if (!user.tokens.includes(refreshToken)) {
                        user.tokens = [];
                        await user.save();
                        reject();
                        return;
                    }

                    user.tokens = user.tokens.filter((token) => token !== refreshToken);
                    await user.save();

                    resolve(user);
                } catch (err) {
                    reject();
                    return;
                }
            });
        }
    );
};
