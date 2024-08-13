import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { logger } from "../utils";
import { subDays } from "date-fns";

const prisma = new PrismaClient();

export default async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.user_id);

    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const oneWeekAgo = subDays(new Date(), 7);

    const sleepData = await prisma.sleepRecord.findMany({
      where: {
        userId: userId,
        sleepDate: {
          gte: oneWeekAgo,
        },
      },
      select: {
        sleepDate: true,
        sleepDuration: true,
      },
      // orderBy: {
      //   sleepDate: "asc",
      // },
    });

    if (sleepData.length === 0) {
      return res.status(404).json({ error: "No sleep data found for this user in the past week" });
    }

    const chartData = sleepData.map(record => ({
      date: record.sleepDate.toISOString().split('T')[0],
      sleepDuration: record.sleepDuration,
    }));

    res.status(200).json(chartData);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: "Failed to retrieve sleep chart data" });
  }
};