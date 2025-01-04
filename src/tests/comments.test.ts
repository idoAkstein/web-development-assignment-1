import request from 'supertest';
import { initApp } from '../server/initApp';
import mongoose from 'mongoose';
import { commentModel } from '../models/comments';
import { Express } from 'express';
import { User, userModel } from '../models';
import { postModel } from '../models';

var app: Express;
const testUser: User = {
    username: 'testuser',
    email: 'test@user.com',
    password: 'testpassword',
    birthDate: new Date('1990-01-01'),
};
let userId: string;
let postID: string;

beforeAll(async () => {
    app = await initApp();
    await commentModel.deleteMany();
    await userModel.deleteMany();
    await postModel.deleteMany();

    const user = await userModel.create(testUser);
    userId = user._id.toJSON();

    postID = (
        await postModel.create({
            sender: userId,
            title: 'Test Post',
            content: 'Test Content',
        })
    )._id.toJSON();
});

afterAll((done) => {
    mongoose.connection.close();
    //close the connection of the server

    done();
});

let commentId = '';

describe('Comments Tests', () => {
    test('Test Create Comment', async () => {
        const {
            statusCode,
            body: { content: expectedContent, postID: expectedPostId, sender: expectedSender, _id },
        } = await request(app).post('/comments').send({
            sender: userId,
            content: 'Test Comment',
            postID,
        });
        expect(statusCode).toBe(200);
        expect(expectedContent).toBe('Test Comment');
        expect(expectedPostId).toBe(postID);
        expect(expectedSender).toBe(userId);
        commentId = _id;
    });

    test('Test get comment by id', async () => {
        const {
            statusCode,
            body: {
                comment: { content: expectedContent, postID: expectedPostId, sender },
            },
        } = await request(app).get('/comments/' + commentId);
        expect(statusCode).toBe(200);
        expect(expectedContent).toBe('Test Comment');
        expect(expectedPostId).toBe(postID);
        expect(sender).toBe(userId);
    });

    test('Test add another comment to the same post', async () => {
        const {
            statusCode,
            body: { content: expectedContent, postID: expectedPostId, sender: expectedSender },
        } = await request(app).post('/comments').send({
            sender: userId,
            content: 'Test Comment 2',
            postID,
        });
        expect(statusCode).toBe(200);
        expect(expectedContent).toBe('Test Comment 2');
        expect(expectedPostId).toBe(postID);
        expect(expectedSender).toBe(userId);
    });

    test('Test get comments by post id', async () => {
        const {
            statusCode,
            body: { comments },
        } = await request(app).get('/comments/post/' + postID);
        expect(statusCode).toBe(200);
        expect(comments.length).toBe(2);
        expect(comments[0].content).toBe('Test Comment');
        expect(comments[0].postID).toBe(postID);
        expect(comments[0].sender).toBe(userId);
        expect(comments[1].content).toBe('Test Comment 2');
        expect(comments[1].postID).toBe(postID);
        expect(comments[1].sender).toBe(userId);
    });

    test('Test edit comment', async () => {
        const {
            statusCode,
            body: { message },
        } = await request(app)
            .put('/comments/' + commentId)
            .send({ content: 'Edited Comment' });
        expect(statusCode).toBe(200);
        expect(message).toBe('update succeeded');
    });

    test('Test delete comment', async () => {
        const {
            statusCode,
            body: { deletedComment },
        } = await request(app).delete('/comments/' + commentId);
        expect(statusCode).toBe(200);
        expect(deletedComment.deletedCount).toBe(1);
    });
});
