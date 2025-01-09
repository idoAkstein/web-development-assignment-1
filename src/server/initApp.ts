import bodyParser from 'body-parser';
import Express, { NextFunction, Request, Response } from 'express';
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUI from 'swagger-ui-express';
import { authenticate } from '../middlewares';
import { authRouter, commentRouter, postRouter, userRouter } from '../routers';
import { getConfig, initDBConnection } from '../services';

export const initApp = async () => {
    await initDBConnection();
    const { port } = getConfig();

    const app = Express();

    const options = {
        definition: {
            openapi: '3.0.0',
            info: {
                title: 'Web Dev Assignment 2 REST API',
                version: '1.0.0',
                description: 'REST server including authentication using JWT',
            },
            servers: [{ url: 'http://localhost:3000' }],
        },
        apis: ['./src/docs/*.ts'],
    };
    app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerJsDoc(options)));

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
