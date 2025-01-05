import { compare } from 'bcrypt';
import { Router } from 'express';
import { createUser } from '../bl';
import { findUserByUsername, isUsernameExists } from '../dal';
import { createToken } from '../services';

export const authRouter = Router();

authRouter.post('/register', async (req, res) => {
    const { username, email, password, birthDate } = req.body;
    if (!username || !email || !password || !birthDate) {
        res.status(400).send({ message: 'body param is missing (username, email, password, birthDate)' });
        return;
    }
    if (await isUsernameExists(username)) {
        res.status(400).send({ message: `username: ${username} already exists` });
        return;
    }

    const user = await createUser({ username, email, password, birthDate });
    res.status(200).send(user);
});

authRouter.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        res.status(400).send({ message: 'body param is missing (username, password)' });
        return;
    }

    const user = await findUserByUsername(username);
    if (!user || !(await compare(password, user.password))) {
        res.status(400).send({ message: 'username or password is incorrect' });
        return;
    }

    res.status(200).send({ token: createToken({ id: user._id }) });
});

authRouter.post('/logout', async (_req, res) => {
    // const token = req.headers.authorization;
    // if (!token) {
    //     res.status(400).send({ message: 'token is missing' });
    //     return;
    // }

    // await deleteToken(token);
    res.status(200).send({ message: 'logout succeeded' });
});
