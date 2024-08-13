import request from "supertest";
import { app } from "../../app";
import { PrismaClient } from "@prisma/client";
import { format, subDays } from "date-fns";

const prisma = new PrismaClient();

describe("GET /api/users/:user_id/sleepChartData", () => {
  let userId: number;

  beforeAll(async () => {
    const user = await prisma.user.create({
      data: {
        name: "Test User",
        email: "testuser@example.com",
        gender: "NON_BINARY",
      },
    });

    userId = user.id;

    const sleepDates = Array.from({ length: 7 }, (_, i) =>
      format(subDays(new Date(), i), "yyyy-MM-dd")
    );

    await prisma.sleepRecord.createMany({
      data: sleepDates.map((date, i) => ({
        sleepDuration: 8 + i,
        sleepDate: new Date(date),
        userId: user.id,
      })),
    });
  });

  afterAll(async () => {
    await prisma.sleepRecord.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } });
    await prisma.$disconnect();
  });

  it("should return sleep chart data for the past week", async () => {
    const response = await request(app).get(`/api/users/${userId}/sleepChartData`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBeLessThanOrEqual(7);

    response.body.forEach((record: any, index: number) => {
      expect(record).toHaveProperty("date");
      expect(record).toHaveProperty("sleepDuration", 8 + index);
    });
  });

  it("should return a 404 error if no sleep data is found for the user", async () => {
    const newUser = await prisma.user.create({
      data: {
        name: "New User",
        email: "newuser@example.com",
        gender: "MALE",
      },
    });

    const response = await request(app).get(`/api/users/${newUser.id}/sleepChartData`);
    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty("error", "No sleep data found for this user in the past week");

    await prisma.user.delete({ where: { id: newUser.id } });
  });

  it("should return a 400 error if the user ID is invalid", async () => {
    const response = await request(app).get("/api/users/invalid-id/sleepChartData");
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("error", "Invalid user ID");
  });
});