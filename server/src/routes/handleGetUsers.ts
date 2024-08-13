import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { logger } from "../utils";

const prisma = new PrismaClient();

export default async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;

    const users = await prisma.user.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        name: true,
        gender: true,
        id: true,
        _count: {
          select: { sleepRecords: true },
        },
      },
    });

    const totalUsers = await prisma.user.count();

    res.status(200).json({
      data: users.map(user => ({
        id: user.id,
        name: user.name,
        gender: user.gender,
        recordCount: user._count.sleepRecords,
      })),
      meta: {
        page,
        pageSize,
        totalUsers,
        totalPages: Math.ceil(totalUsers / pageSize),
      },
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: "Failed to retrieve users" });
  }
};
