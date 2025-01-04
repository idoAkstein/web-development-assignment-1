import { Request, Router } from 'express';
import { isValidObjectId } from 'mongoose';
import { createPost, editPost, getAllPosts, getPostById, getUserById } from '../dal';

export const postRouter = Router();

postRouter.get('/', async (req: Request<{}, {}, {}, Record<string, string | undefined>>, res) => {
    const { sender } = req.query;
    if (sender && (!isValidObjectId(sender) || (await getUserById(sender)) === null)) {
        res.status(400).send({ message: `sender with id: ${sender} doesn't exists` });
        return;
    }

    res.status(200).send({ posts: await getAllPosts(req.query) });
});

postRouter.post('/', async (req, res) => {
    const { sender, content, title } = req.body;
    if (!sender || !title) {
        res.status(400).send({ message: 'body param is missing (sender or title)' });
        return;
    }
    if (!isValidObjectId(sender) || (await getUserById(sender)) === null) {
        res.status(400).send({ message: `sender with id: ${sender} doesn't exists` });
        return;
    }

    const post = await createPost(title, sender, content);
    res.status(200).send(post);
});

postRouter.get('/:id', async (req, res) => {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
        res.status(400).send({ message: `id: ${id} is not valid` });
        return;
    }

    const post = await getPostById(id);
    if (!post) {
        res.status(404).send({ message: `didn't find post with id: ${id}` });
        return;
    }

    res.status(200).send({ post });
});

postRouter.put('/:id', async (req, res) => {
    const id = req.params.id;
    if (!isValidObjectId(id) || (await getPostById(id)) === null) {
        res.status(400).send({ message: `post with id: ${id} doesn't exist` });
        return;
    }
    const { sender, content, title } = req.body;

    const updatedPost = await editPost(id, title, sender, content);
    res.status(200).send(updatedPost);
});
