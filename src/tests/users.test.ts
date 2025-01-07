import request from 'supertest';
import mongoose from 'mongoose';
import { commentModel } from '../models/comments';
import { Express } from 'express';
import { User, userModel } from '../models';
import { postModel } from '../models';
import { createUserInDB } from '../dal';

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
});

afterAll(async () => {
    mongoose.connection.close();
    //close the connection of the server
    await global.closeTestServer();
});

describe('Users Tests', () => {
    test('Edit user', async () => {
        const {
            statusCode,
            body: { message },
        } = await request(app)
            .put(`/users/${userId}`)
            .send({
                email: 'newEmail@gmail.com',
            })
            .set({ authorization: 'bearer ' + testUser.tokens[0] });
        expect(statusCode).toBe(200);
        expect(message).toBe('update succeeded');
    });

    test('Edit user with invalid id', async () => {
        const { statusCode } = await request(app)
            .put('/users/123')
            .send({ email: 'ersafsd' })
            .set({ authorization: 'bearer ' + testUser.tokens[0] });
        expect(statusCode).toBe(400);
    });
    test('Edit user with non existing id', async () => {
        const { statusCode } = await request(app)
            .put(`/users/${userId}1`)
            .send({ email: 'ersafsd' })
            .set({ authorization: 'bearer ' + testUser.tokens[0] });
        expect(statusCode).toBe(400);
    });

    test('Get user', async () => {
        const {
            statusCode,
            body: { username, email },
        } = await request(app)
            .get(`/users/${userId}`)
            .set({ authorization: 'bearer ' + testUser.tokens[0] });
        expect(statusCode).toBe(200);
        expect(username).toBe(testUser.username);
        expect(email).toBe('newEmail@gmail.com');
    });

    test('Get user with invalid id', async () => {
        const { statusCode } = await request(app)
            .get('/users/123')
            .set({ authorization: 'bearer ' + testUser.tokens[0] });
        expect(statusCode).toBe(400);
    });

    test('Get user with non existing id', async () => {
        const { statusCode } = await request(app)
            .get(`/users/${userId}1`)
            .set({ authorization: 'bearer ' + testUser.tokens[0] });
        expect(statusCode).toBe(400);
    });

    test('Get all users', async () => {
        await createUserInDB({
            username: 'ggs',
            email: 'dgsffsd',
            password: '123',
            birthDate: new Date('03-03-23'),
        });
        const {
            statusCode,
            body: {
                users: { length },
            },
        } = await request(app)
            .get('/users')
            .set({ authorization: 'bearer ' + testUser.tokens[0] });
        expect(statusCode).toBe(200);
        expect(length).toBe(2);
    });

    test('Delete user', async () => {
        const { statusCode, body } = await request(app)
            .delete(`/users/${userId}`)
            .set({ authorization: 'bearer ' + testUser.tokens[0] });
        expect(statusCode).toBe(200);
        expect(body.message).toBe('delete succeeded');
    });

    test('Delete user with invalid id', async () => {
        const { statusCode } = await request(app)
            .delete('/users/123')
            .set({ authorization: 'bearer ' + testUser.tokens[0] });
        expect(statusCode).toBe(400);
    });
    test('Delete user with non existing id', async () => {
        const { statusCode } = await request(app)
            .delete(`/users/${userId}`)
            .set({ authorization: 'bearer ' + testUser.tokens[0] });
        expect(statusCode).toBe(400);
    });
});
