import request from "supertest";
import {initApp} from "../server/initApp";
import mongoose from "mongoose";
import {postModel}  from "../models/post";
import { Express } from "express";
// import userModel, { IUser } from "../models/users";

var app: Express;

// type User = IUser & { token?: string };
// const testUser: User = {
//   email: "test@user.com",
//   password: "testpassword",
// }

beforeAll(async () => {
  app = await initApp();
  await postModel.deleteMany();

//   await userModel.deleteMany();
//   await request(app).post("/auth/register").send(testUser);
//   const res = await request(app).post("/auth/login").send(testUser);
//   testUser.token = res.body.token;
//   testUser._id = res.body._id;
//   expect(testUser.token).toBeDefined();
});

afterAll((done) => {
  mongoose.connection.close();
  done();
});

let postId = "";
describe("Posts Tests", () => {
  test("Posts test get all", async () => {
    const response = await request(app).get("/posts");
    expect(response.statusCode).toBe(200);
    expect(response.body.posts.length).toBe(0);
  });

  test("Test Create Post", async () => {
    const response = await request(app).post("/posts")
    //   .set({ authorization: "JWT " + testUser.token })
      .send({
        title: "Test Post",
        content: "Test Content",
        sender: "TestSender",
      });
    expect(response.statusCode).toBe(200);
    expect(response.body.title).toBe("Test Post");
    expect(response.body.content).toBe("Test Content");
    postId = response.body._id;
  });

  test("Test get post by sender", async () => {
    const response = (await request(app).get("/posts").query({ sender: "TestSender" }));
    expect(response.statusCode).toBe(200);
    expect(response.body.posts.length).toBe(1);
    expect(response.body.posts[0].title).toBe("Test Post");
    expect(response.body.posts[0].content).toBe("Test Content");
  });

  test("Test update post content", async () => {
    const response = await request(app).put(`/posts/${postId}`)
    //   .set({ authorization: "JWT " + testUser.token })
      .send({
        content: "Test Content Updated",
      });
    expect(response.statusCode).toBe(200);
    expect(response.body.modifiedCount).toBe(1);
  });

  test("Test get post by id", async () => {
    const response = await request(app).get(`/posts/${postId}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.post.title).toBe("Test Post");
    expect(response.body.post.content).toBe("Test Content Updated");
  });

  test("Test Create Post 2", async () => {
    const response = await request(app).post("/posts")
    //   .set({ authorization: "JWT " + testUser.token })
      .send({
        title: "Test Post 2",
        content: "Test Content 2",
        sender: "TestOwner2",
      });
    expect(response.statusCode).toBe(200);
  });

  test("Posts test get all 2", async () => {
    const response = await request(app).get("/posts");
    expect(response.statusCode).toBe(200);
    expect(response.body.posts.length).toBe(2);
  });


  test("Test Create Post fail", async () => {
    const response = await request(app).post("/posts")
    //   .set({ authorization: "JWT " + testUser.token })
      .send({
        content: "Test Content 2",
      });
    expect(response.statusCode).toBe(400);
  });
});