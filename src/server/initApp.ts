import bodyParser from 'body-parser';
import Express, { NextFunction, Request, Response } from 'express';
import { postRouter, commentRouter } from '../routers';
import { initDBConnection } from '../services';
import { config } from 'dotenv';

config();

export const initApp = async () => {
    await initDBConnection();

    const port = process.env.PORT || 8080;
    const app = Express();

    app.use(bodyParser.json());
    app.use('/posts', postRouter);
    app.use('/comments', commentRouter);

    app.use((_err: Error, _req: Request, res: Response, _next: NextFunction) => {
        res.status(500).send({ message: 'Error' });
    });

    app.listen(port, () => {
        console.log(`listening on port ${port}`);
    });

    return app;
};
