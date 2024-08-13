import request from "supertest";
import { app } from "../../app";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

describe("POST /api/sleepRecord", () => {
  afterAll(async () => {
    await prisma.sleepRecord.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
  });

  it("should create a new sleep record with valid data", async () => {
    const response = await request(app)
      .post("/api/sleepRecord")
      .send({
        sleepDuration: 480,
        sleepDate: "08/12/2024",
        user: {
          name: "John Doe",
          email: "johndoe@example.com",
          gender: "MALE",
        },
      });

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("sleepDuration", 480);
    expect(response.body).toHaveProperty("userId");

    const user = await prisma.user.findUnique({ where: { email: "johndoe@example.com" } });
    expect(user).not.toBeNull();
    expect(user?.name).toBe("John Doe");
  });

  it("should return 400 for invalid data", async () => {
    const response = await request(app)
      .post("/api/sleepRecord")
      .send({
        sleepDuration: -10,
        sleepDate: "invalid-date",
        user: {
          name: "",
          email: "not-an-email",
        },
      });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("errors");
    expect(response.body.errors).toBeInstanceOf(Array);
  });

  it("should create a new user if one does not exist", async () => {
    const response = await request(app)
      .post("/api/sleepRecord")
      .send({
        sleepDuration: 6,
        sleepDate: "08/12/2024",
        user: {
          name: "Jane Doe",
          email: "janedoe@example.com",
          gender: "FEMALE",
        },
      });

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("userId");

    const user = await prisma.user.findUnique({ where: { email: "janedoe@example.com" } });
    expect(user).not.toBeNull();
    expect(user?.name).toBe("Jane Doe");
  });

  it("should link the sleep record to an existing user", async () => {
    const existingUser = await prisma.user.create({
      data: {
        name: "Existing User",
        email: "existinguser@example.com",
        gender: "NON_BINARY",
      },
    });

    const response = await request(app)
      .post("/api/sleepRecord")
      .send({
        sleepDuration: 7,
        sleepDate: "08/13/2024",
        user: {
          name: "Existing User",
          email: "existinguser@example.com",
          gender: "NON_BINARY",
        },
      });

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("userId", existingUser.id);

    const sleepRecord = await prisma.sleepRecord.findFirst({
      where: { userId: existingUser.id },
    });
    expect(sleepRecord).not.toBeNull();
    expect(sleepRecord?.sleepDuration).toBe(7);
  });
});