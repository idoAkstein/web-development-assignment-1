import request from 'supertest';
import mongoose from 'mongoose';
import { Express } from 'express';
import { User, userModel } from '../models/user';
import { commentModel, postModel } from '../models';

let app: Express;

const testUser: User = {
    username: 'testuser',
    email: 'test@user.com',
    password: 'testpassword',
    birthDate: new Date('1990-01-01'),
};
let userId: string;
beforeAll(async () => {
    app = await global.initTestServer();
    await commentModel.deleteMany();
    await userModel.deleteMany();
    await postModel.deleteMany();
    const user = await userModel.create(testUser);
    userId = user._id.toJSON();
    // await request(app).post('/auth/register').send(testUser);
    // const res = await request(app).post('/auth/login').send(testUser);
    // testUser.token = res.body.token;
    // testUser._id = res.body._id;
    // expect(testUser.token).toBeDefined();
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
        } = await request(app).get('/posts');
        expect(statusCode).toBe(200);
        expect(posts.length).toBe(0);
    });

    test('Test Create Post', async () => {
        const {
            statusCode,
            body: { title, content, _id },
        } = await request(app)
            .post('/posts')
            //   .set({ authorization: "JWT " + testUser.token })
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
        } = await request(app).get('/posts').query({ sender: userId });
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
            //   .set({ authorization: "JWT " + testUser.token })
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
        } = await request(app).get(`/posts/${postId}`);
        expect(statusCode).toBe(200);
        expect(title).toBe('Test Post');
        expect(content).toBe('Test Content Updated');
    });

    test('Test Create Post 2', async () => {
        const { statusCode } = await request(app)
            .post('/posts')
            //   .set({ authorization: "JWT " + testUser.token })
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
        } = await request(app).get('/posts');
        expect(statusCode).toBe(200);
        expect(posts.length).toBe(2);
    });

    test('Test Create Post fail', async () => {
        const { statusCode } = await request(app)
            .post('/posts')
            //   .set({ authorization: "JWT " + testUser.token })
            .send({
                content: 'Test Content 2',
            });
        expect(statusCode).toBe(400);
    });
});
