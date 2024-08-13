import request from "supertest";
import { app } from "../../app";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

describe("GET /api/users", () => {
  beforeAll(async () => {
    await prisma.$executeRaw`TRUNCATE TABLE "User" CASCADE;`
    await prisma.user.create({
      data: {
        name: "User One",
        email: "userone@example.com",
        gender: "MALE",
        sleepRecords: {
          create: [
            { sleepDuration: 420, sleepDate: new Date("2024-08-01") },
            { sleepDuration: 430, sleepDate: new Date("2024-08-02") },
          ],
        },
      },
    });

    await prisma.user.create({
      data: {
        name: "User Two",
        email: "usertwo@example.com",
        gender: "FEMALE",
        sleepRecords: {
          create: [
            { sleepDuration: 380, sleepDate: new Date("2024-08-01") },
          ],
        },
      },
    });

    await prisma.user.create({
      data: {
        name: "User Three",
        email: "userthree@example.com",
        gender: "NON_BINARY",
        sleepRecords: {
          create: [
            { sleepDuration: 400, sleepDate: new Date("2024-08-03") },
            { sleepDuration: 450, sleepDate: new Date("2024-08-04") },
            { sleepDuration: 460, sleepDate: new Date("2024-08-05") },
          ],
        },
      },
    });
  });

  afterAll(async () => {
    await prisma.sleepRecord.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
  });

  it("should return a paginated list of users with their record counts", async () => {
    const response = await request(app).get("/api/users?page=1&pageSize=2");

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("data");
    expect(response.body.data).toBeInstanceOf(Array);
    expect(response.body.data.length).toBe(2);

    response.body.data.forEach((user: any) => {
      expect(user).toHaveProperty("name");
      expect(user).toHaveProperty("gender");
      expect(user).toHaveProperty("recordCount");
    });

    expect(response.body).toHaveProperty("meta");
    expect(response.body.meta).toHaveProperty("page", 1);
    expect(response.body.meta).toHaveProperty("pageSize", 2);
    expect(response.body.meta).toHaveProperty("totalUsers");
    expect(response.body.meta).toHaveProperty("totalPages");
  });

  it("should return the second page of users with correct pagination", async () => {
    const response = await request(app).get("/api/users?page=2&pageSize=2");

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("data");
    expect(response.body.data).toBeInstanceOf(Array);
    expect(response.body.data.length).toBe(1);

    response.body.data.forEach((user: any) => {
      expect(user).toHaveProperty("name");
      expect(user).toHaveProperty("gender");
      expect(user).toHaveProperty("recordCount");
    });

    expect(response.body).toHaveProperty("meta");
    expect(response.body.meta).toHaveProperty("page", 2);
    expect(response.body.meta).toHaveProperty("pageSize", 2);
    expect(response.body.meta).toHaveProperty("totalUsers");
    expect(response.body.meta).toHaveProperty("totalPages");
  });

  it("should return an empty list when requesting a page that doesn't exist", async () => {
    const response = await request(app).get("/api/users?page=10&pageSize=2");

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("data");
    expect(response.body.data).toBeInstanceOf(Array);
    expect(response.body.data.length).toBe(0);

    expect(response.body).toHaveProperty("meta");
    expect(response.body.meta).toHaveProperty("page", 10);
    expect(response.body.meta).toHaveProperty("pageSize", 2);
    expect(response.body.meta).toHaveProperty("totalUsers");
    expect(response.body.meta).toHaveProperty("totalPages");
  });
});