import bodyParser from 'body-parser';
import { config } from 'dotenv';
import Express, { NextFunction, Request, Response } from 'express';
import { authenticate } from '../middlewares';
import { authRouter, commentRouter, postRouter, userRouter } from '../routers';
import { getConfig, initDBConnection } from '../services';

config();

export const initApp = async () => {
    await initDBConnection();
    const { port } = getConfig();

    const app = Express();

    app.use(bodyParser.json());
    app.use('/auth', authRouter);

    app.use(authenticate);
    app.use('/posts', postRouter);
    app.use('/comments', commentRouter);
    app.use('/users', userRouter);

    app.use((_err: Error, _req: Request, res: Response, _next: NextFunction) => {
        res.status(500).send({ message: 'Error' });
    });

    const server = app.listen(port, () => {
        console.log(`listening on port ${port}`);
    });

    return { app, server };
};
