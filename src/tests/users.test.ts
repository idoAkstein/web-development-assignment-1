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
});

afterAll((done) => {
    mongoose.connection.close();
    //close the connection of the server

    done();
});

let commentId = '';

describe('Users Tests', () => {
    test('Test Create user', async () => {
        const {
            statusCode,
            body: { _id, username, email, password, birthDate },
        } = await request(app).post('/users').send(testUser);
        userId = _id;
        expect(statusCode).toBe(200);
        expect(username).toBe(testUser.username);
        expect(email).toBe(testUser.email);
        expect(password).toBe(testUser.password);
        expect(birthDate).toBe(testUser.birthDate.toISOString());
    });
    test('Test create user with missing body param - username', async () => {
        const { statusCode } = await request(app)
            .post('/users')
            .send({
                email: 'example@gmail.com',
                password: 'testpassword',
                birthDate: new Date('1990-01-01'),
            });
        expect(statusCode).toBe(400);
    });
    test('Test create user with missing body param - email', async () => {
        const { statusCode } = await request(app)
            .post('/users')
            .send({
                username: 'tests242q',
                password: 'testpassword',
                birthDate: new Date('1990-01-01'),
            });
        expect(statusCode).toBe(400);
    });
    test('Test create user with missing body param - password', async () => {
        const { statusCode } = await request(app)
            .post('/users')
            .send({
                email: 'example@gmail.com',
                username: 'testpassword',
                birthDate: new Date('1990-01-01'),
            });
        expect(statusCode).toBe(400);
    });
    test('Test create user with missing body param - birthdate', async () => {
        const { statusCode } = await request(app).post('/users').send({
            email: 'example@gmail.com',
            password: 'testpassword',
            username: 'sfdsf',
        });
        expect(statusCode).toBe(400);
    });

    test('Test create user with existing username', async () => {
        const { statusCode } = await request(app)
            .post('/users')
            .send({
                username: 'testuser',
                email: 'example@gmail.com',
                password: 'testpassword',
                birthDate: new Date('1990-01-01'),
            });
        expect(statusCode).toBe(400);
    });

    test('Edit user', async () => {
        const {
            statusCode,
            body: { message },
        } = await request(app).put(`/users/${userId}`).send({
            email: 'newEmail@gmail.com',
        });
        expect(statusCode).toBe(200);
        expect(message).toBe('update succeeded');
    });

    test('Edit user with invalid id', async () => {
        const { statusCode } = await request(app).put('/users/123').send({ email: 'ersafsd' });
        expect(statusCode).toBe(400);
    });
    test('Edit user with non existing id', async () => {
        const { statusCode } = await request(app).put(`/users/${userId}1`).send({ email: 'ersafsd' });
        expect(statusCode).toBe(400);
    });

    test('Get user', async () => {
        const {
            statusCode,
            body: { username, email, password, birthDate },
        } = await request(app).get(`/users/${userId}`);
        expect(statusCode).toBe(200);
        expect(username).toBe(testUser.username);
        expect(email).toBe('newEmail@gmail.com');
        expect(password).toBe(testUser.password);
        expect(birthDate).toBe(testUser.birthDate.toISOString());
    });

    test('Get user with invalid id', async () => {
        const { statusCode } = await request(app).get('/users/123');
        expect(statusCode).toBe(400);
    });

    test('Get user with non existing id', async () => {
        const { statusCode } = await request(app).get(`/users/${userId}1`);
        expect(statusCode).toBe(400);
    });

    test('Get all users', async () => {
        await request(app)
            .post('/users')
            .send({
                username: 'testuser2',
                email: 'test2@gmail.com',
                password: '123',
                birthDate: new Date('1990-01-01'),
            });
        const {
            statusCode,
            body: {
                users: { length },
            },
        } = await request(app).get('/users');
        expect(statusCode).toBe(200);
        expect(length).toBe(2);
    });

    test('Delete user', async () => {
        const { statusCode, body } = await request(app).delete(`/users/${userId}`);
        expect(statusCode).toBe(200);
        expect(body.message).toBe('delete succeeded');
    });

    test('Delete user with invalid id', async () => {
        const { statusCode } = await request(app).delete('/users/123');
        expect(statusCode).toBe(400);
    });
    test('Delete user with non existing id', async () => {
        const { statusCode } = await request(app).delete(`/users/${userId}`);
        expect(statusCode).toBe(400);
    });
});
