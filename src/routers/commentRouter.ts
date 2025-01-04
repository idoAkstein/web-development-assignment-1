import { Router } from 'express';
import { isValidObjectId } from 'mongoose';
import {
    createComment,
    deleteComment,
    editComment,
    getCommentByID,
    getCommentsByPostID,
    getPostById,
    getUserById,
} from '../dal';

export const commentRouter = Router();

commentRouter.delete('/:id', async (req, res) => {
    const id = req.params.id;
    if (!isValidObjectId(id) || (await getCommentByID(id)) === null) {
        res.status(400).send({ message: `comment with id: ${id} doesn't exists` });
        return;
    }

    const deletedComment = await deleteComment(id);
    res.status(200).send({ deletedComment });
});

commentRouter.get('/post/:postID', async (req, res) => {
    const postID = req.params.postID;
    if (!isValidObjectId(postID) || (await getPostById(postID)) === null) {
        res.status(400).send({ message: `post with id: ${postID} doesn't exists` });
        return;
    }

    const comments = await getCommentsByPostID(postID);

    res.status(200).send({ comments });
});

commentRouter.post('/', async (req, res) => {
    const { sender, content, postID } = req.body;
    if (!sender || !postID) {
        res.status(400).send({ message: 'body param is missing (sender or postID)' });
        return;
    }
    if (!isValidObjectId(postID) || (await getPostById(postID)) === null) {
        res.status(400).send({ message: `post with id: ${postID} doesn't exists` });
        return;
    }
    if (!isValidObjectId(sender) || (await getUserById(sender)) === null) {
        res.status(400).send({ message: `sender with id: ${sender} doesn't exists` });
        return;
    }

    const comment = await createComment({ sender, content, postID });
    res.status(200).send(comment);
});

commentRouter.put('/:id', async (req, res) => {
    const { id } = req.params;
    if (!isValidObjectId(id) || (await getCommentByID(id)) === null) {
        res.status(400).send({ message: `comment with id: ${id} doesn't exists` });
        return;
    }

    const { postID: _, ...body } = req.body;
    await editComment(body, id);

    res.status(200).send({ message: 'update succeeded' });
});

commentRouter.get('/:id', async (req, res) => {
    const { id: commentID } = req.params;
    if (!isValidObjectId(commentID)) {
        res.status(400).send({ message: `Comment id ${commentID} is not valid` });
        return;
    }

    const comment = await getCommentByID(commentID);
    if (!comment) {
        res.status(404).send({ message: `comment with id: ${commentID} doesn't exists` });
    }

    res.status(200).send({ comment });
});
