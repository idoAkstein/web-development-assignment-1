import { Router } from 'express';
import { userModel } from '../models';

export const userRouter = Router();

userRouter.post('/', async (req, res) => {
    const { username, email, password, birthDate } = req.body;
    if (!username || !email || !password || !birthDate) {
        res.status(400).send({ message: 'body param is missing (username, email, password, birthDate)' });
        return;
    }

    const user = await userModel.create({ username, email, password, birthDate });
    res.status(200).send(user);
});
