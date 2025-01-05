import bodyParser from 'body-parser';
import { config } from 'dotenv';
import Express, { NextFunction, Request, Response } from 'express';
import { commentRouter, postRouter } from '../routers';
import { userRouter } from '../routers/userRouter';
import { initDBConnection } from '../services';

config();

export const initApp = async () => {
    await initDBConnection();

    const port = process.env.PORT || 8080;
    const app = Express();

    app.use(bodyParser.json());
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
