import request from 'supertest';
import mongoose from 'mongoose';
import { postModel } from '../models/post';
import { Express } from 'express';
import { userModel, User } from '../models/user';
import { commentModel } from '../models';

var app: Express;

beforeAll(async () => {
    app = await global.initTestServer();
    await userModel.deleteMany();
    await postModel.deleteMany();
    await commentModel.deleteMany();
});

afterAll(async () => {
    mongoose.connection.close();
    await global.closeTestServer();
});

const baseUrl = '/auth';

const testUser: User & { _id: string; accessToken: string; refreshToken: string } = {
    email: 'test@user.com',
    password: 'testpassword',
    birthDate: new Date('02-02-22'),
    username: 'test',
    _id: '',
    tokens: [],
    accessToken: '',
    refreshToken: '',
};

describe('Auth Tests', () => {
    test('Auth test register', async () => {
        const response = await request(app)
            .post(baseUrl + '/register')
            .send(testUser);
        expect(response.statusCode).toBe(200);
        testUser._id = response.body._id;
    });

    test('Auth test register fail', async () => {
        const response = await request(app)
            .post(baseUrl + '/register')
            .send(testUser);
        expect(response.statusCode).not.toBe(200);
    });

    test('Auth test register fail', async () => {
        const response = await request(app)
            .post(baseUrl + '/register')
            .send({
                email: 'sdsdfsd',
            });
        expect(response.statusCode).not.toBe(200);
        const response2 = await request(app)
            .post(baseUrl + '/register')
            .send({
                email: '',
                password: 'sdfsd',
            });
        expect(response2.statusCode).not.toBe(200);
    });

    test('Auth test login', async () => {
        const response = await request(app)
            .post(baseUrl + '/login')
            .send(testUser);
        expect(response.statusCode).toBe(200);
        const accessToken = response.body.accessToken;
        const refreshToken = response.body.refreshToken;
        expect(accessToken).toBeDefined();
        expect(refreshToken).toBeDefined();
        testUser.accessToken = accessToken;
        testUser.refreshToken = refreshToken;
    });

    test('Check tokens are not the same', async () => {
        const response = await request(app)
            .post(baseUrl + '/login')
            .send(testUser);
        const accessToken = response.body.accessToken;
        const refreshToken = response.body.refreshToken;

        expect(accessToken).not.toBe(testUser.accessToken);
        expect(refreshToken).not.toBe(testUser.refreshToken);
    });

    test('Auth test login fail', async () => {
        const response = await request(app)
            .post(baseUrl + '/login')
            .send({
                email: testUser.email,
                password: 'sdfsd',
            });
        expect(response.statusCode).not.toBe(200);

        const response2 = await request(app)
            .post(baseUrl + '/login')
            .send({
                username: 'dsfasd',
                password: 'sdfsd',
            });
        expect(response2.statusCode).not.toBe(200);
    });

    test('Auth test me', async () => {
        const response = await request(app).post('/posts').send({
            title: 'Test Post',
            content: 'Test Content',
            owner: 'sdfSd',
        });
        expect(response.statusCode).not.toBe(200);
        const response2 = await request(app)
            .post('/posts')
            .set({ authorization: 'bearer ' + testUser.accessToken })
            .send({
                title: 'Test Post',
                content: 'Test Content',
                sender: testUser._id,
            });
        expect(response2.statusCode).toBe(200);
    });

    test('Test refresh token', async () => {
        const response = await request(app)
            .post(baseUrl + '/refresh')
            .send({
                refreshToken: testUser.refreshToken,
            });
        expect(response.statusCode).toBe(200);
        expect(response.body.accessToken).toBeDefined();
        expect(response.body.refreshToken).toBeDefined();
        testUser.accessToken = response.body.accessToken;
        testUser.refreshToken = response.body.refreshToken;
    });

    test('Double use refresh token', async () => {
        const response = await request(app)
            .post(baseUrl + '/refresh')
            .send({
                refreshToken: testUser.refreshToken,
            });
        expect(response.statusCode).toBe(200);
        const refreshTokenNew = response.body.refreshToken;

        const response2 = await request(app)
            .post(baseUrl + '/refresh')
            .send({
                refreshToken: testUser.refreshToken,
            });
        expect(response2.statusCode).not.toBe(200);

        const response3 = await request(app)
            .post(baseUrl + '/refresh')
            .send({
                refreshToken: refreshTokenNew,
            });
        expect(response3.statusCode).not.toBe(200);
    });

    test('Test logout', async () => {
        const response = await request(app)
            .post(baseUrl + '/login')
            .send(testUser);
        expect(response.statusCode).toBe(200);
        testUser.accessToken = response.body.accessToken;
        testUser.refreshToken = response.body.refreshToken;

        const response2 = await request(app)
            .post(baseUrl + '/logout')
            .send({
                refreshToken: testUser.refreshToken,
            });
        expect(response2.statusCode).toBe(200);

        const response3 = await request(app)
            .post(baseUrl + '/refresh')
            .send({
                refreshToken: testUser.refreshToken,
            });
        expect(response3.statusCode).not.toBe(200);

        const response4 = await request(app).post(baseUrl + '/logout');
        expect(response4.statusCode).toBe(400);

        const response5 = await request(app)
            .post(baseUrl + '/logout')
            .send({ refreshToken: 'aaaaaa' });
        expect(response5.statusCode).toBe(400);
    });

    test('Test auth middleware', async () => {
        const response = await request(app)
            .post('/posts')
            .send({ title: 'Test Post', content: 'Test Content', sender: testUser._id });
        expect(response.statusCode).not.toBe(200);

        const response2 = await request(app)
            .post('/posts')
            .set({ authorization: 'bear ' + testUser.accessToken })
            .send({ title: 'Test Post', content: 'Test Content', sender: testUser._id });
        expect(response2.statusCode).toBe(401);

        const response3 = await request(app).post('/posts').set({ authorization: 'bearer aaaaaa' }).send({
            title: 'Test Post',
            content: 'Test Content',
            sender: testUser._id,
        });
        expect(response3.statusCode).toBe(401);

        const response4 = await request(app)
            .post('/posts')
            .set({ authorization: 'bearer ' + testUser.accessToken })
            .send({ title: 'Test Post', content: 'Test Content', sender: testUser._id });
        expect(response4.statusCode).toBe(200);
    });
});
