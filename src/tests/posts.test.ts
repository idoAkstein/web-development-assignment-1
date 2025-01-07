import request from 'supertest';
import mongoose from 'mongoose';
import { Express } from 'express';
import { User, userModel } from '../models/user';
import { commentModel, postModel } from '../models';

let app: Express;

let testUser: User & { _id: string } = {
    username: 'testuser',
    email: 'test@user.com',
    password: 'testpassword',
    birthDate: new Date('1990-01-01'),
    tokens: [],
    _id: '',
};

let userId: string;
beforeAll(async () => {
    app = await global.initTestServer();
    await commentModel.deleteMany();
    await userModel.deleteMany();
    await postModel.deleteMany();
    testUser = (await request(app).post('/auth/register').send(testUser)).body;
    userId = testUser._id;
    const { accessToken } = (
        await request(app)
            .post('/auth/login')
            .send({ ...testUser, password: 'testpassword' })
    ).body;
    testUser.tokens = [accessToken];
    expect(testUser.tokens).toBeDefined();
});

afterAll(async () => {
    mongoose.connection.close();
    await global.closeTestServer();
});

let postId = '';
describe('Posts Tests', () => {
    test('Posts test get all', async () => {
        const {
            statusCode,
            body: { posts },
        } = await request(app)
            .get('/posts')
            .set({ authorization: 'bearer ' + testUser.tokens[0] });
        expect(statusCode).toBe(200);
        expect(posts.length).toBe(0);
    });

    test('Test Create Post', async () => {
        const {
            statusCode,
            body: { title, content, _id },
        } = await request(app)
            .post('/posts')
            .set({ authorization: 'bearer ' + testUser.tokens[0] })
            .send({
                title: 'Test Post',
                content: 'Test Content',
                sender: userId,
            });
        expect(statusCode).toBe(200);
        expect(title).toBe('Test Post');
        expect(content).toBe('Test Content');
        postId = _id;
    });

    test('Test get post by sender', async () => {
        const {
            statusCode,
            body: { posts },
        } = await request(app)
            .get('/posts')
            .query({ sender: userId })
            .set({ authorization: 'bearer ' + testUser.tokens[0] });
        expect(statusCode).toBe(200);
        expect(posts.length).toBe(1);
        expect(posts[0].title).toBe('Test Post');
        expect(posts[0].content).toBe('Test Content');
    });

    test('Test update post content', async () => {
        const {
            statusCode,
            body: { modifiedCount },
        } = await request(app)
            .put(`/posts/${postId}`)
            .set({ authorization: 'bearer ' + testUser.tokens[0] })
            .send({
                content: 'Test Content Updated',
            });
        expect(statusCode).toBe(200);
        expect(modifiedCount).toBe(1);
    });

    test('Test get post by id', async () => {
        const {
            statusCode,
            body: {
                post: { title, content },
            },
        } = await request(app)
            .get(`/posts/${postId}`)
            .set({ authorization: 'bearer ' + testUser.tokens[0] });
        expect(statusCode).toBe(200);
        expect(title).toBe('Test Post');
        expect(content).toBe('Test Content Updated');
    });

    test('Test Create Post 2', async () => {
        const { statusCode } = await request(app)
            .post('/posts')
            .set({ authorization: 'bearer ' + testUser.tokens[0] })
            .send({
                title: 'Test Post 2',
                content: 'Test Content 2',
                sender: userId,
            });
        expect(statusCode).toBe(200);
    });

    test('Posts test get all 2', async () => {
        const {
            statusCode,
            body: { posts },
        } = await request(app)
            .get('/posts')
            .set({ authorization: 'bearer ' + testUser.tokens[0] });
        expect(statusCode).toBe(200);
        expect(posts.length).toBe(2);
    });

    test('Test Create Post fail', async () => {
        const { statusCode } = await request(app)
            .post('/posts')
            .set({ authorization: 'bearer ' + testUser.tokens[0] })
            .send({
                content: 'Test Content 2',
            });
        expect(statusCode).toBe(400);
    });
});
