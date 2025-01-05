import { Router } from 'express';
import { isValidObjectId } from 'mongoose';
import { deleteUser, editUser, getAllUsers, getUserById } from '../dal';

export const userRouter = Router();

userRouter.put('/:id', async (req, res) => {
    const { id } = req.params;
    if (!isValidObjectId(id) || (await getUserById(id)) === null) {
        res.status(400).send({ message: `user with id: ${id} doesn't exists` });
        return;
    }

    await editUser(req.body, id);
    res.status(200).send({ message: 'update succeeded' });
});

userRouter.delete('/:id', async (req, res) => {
    const id = req.params.id;
    if (!isValidObjectId(id) || (await getUserById(id)) === null) {
        res.status(400).send({ message: `user with id: ${id} doesn't exists` });
        return;
    }

    await deleteUser(id);
    res.status(200).send({ message: 'delete succeeded' });
});

userRouter.get('/:id', async (req, res) => {
    const id = req.params.id;
    if (!isValidObjectId(id) || (await getUserById(id)) === null) {
        res.status(400).send({ message: `user with id: ${id} doesn't exists` });
        return;
    }

    const user = await getUserById(id);
    if (!user) {
        res.status(404).send({ message: `didn't find user with id: ${id}` });
        return;
    }

    res.status(200).send(user);
});

userRouter.get('/', async (_req, res) => {
    res.status(200).send({ users: await getAllUsers() });
});
