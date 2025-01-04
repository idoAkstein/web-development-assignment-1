import { Router } from 'express';
import { isValidObjectId } from 'mongoose';
import { createUser, editUser } from '../dal';

export const userRouter = Router();

userRouter.post('/', async (req, res) => {
    const { username, email, password, birthDate } = req.body;
    if (!username || !email || !password || !birthDate) {
        res.status(400).send({ message: 'body param is missing (username, email, password, birthDate)' });
        return;
    }

    const user = await createUser({ username, email, password, birthDate });
    res.status(200).send(user);
});

userRouter.put('/:id', async (req, res) => {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
        res.status(400).send({ message: `id: ${id} is not valid` });
        return;
    }

    await editUser(req.body, id);
    res.status(200).send({ message: 'update succeeded' });
});
