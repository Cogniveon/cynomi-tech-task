import { PrismaClient } from "@prisma/client";
import { isValid, parse } from "date-fns";
import { z } from "zod";
import { Request, Response } from "express";
import { logger } from "../utils";

const prisma = new PrismaClient();

const addSleepRecordSchema = z.object({
  sleepDuration: z.number().min(1, "Sleep duration must be at least 1 hour."),
  sleepDate: z
    .string()
    .refine((date) => isValid(parse(date, "MM/dd/yyyy", new Date())), {
      message: "Invalid date format. Expected format: MM/dd/yyyy.",
    }),
  user: z.object({
    name: z.string().min(1, "Name is required."),
    email: z.string().email("Invalid email format."),
    gender: z
      .enum([
        "MALE",
        "FEMALE",
        "TRANSGENDER",
        "GENDER_NEUTRAL",
        "NON_BINARY",
        "NOT_SPECIFIED",
      ])
      .optional(),
  }),
});

export default async (req: Request, res: Response) => {
  try {
    const validatedData = addSleepRecordSchema.parse(req.body);
    const {
      sleepDuration,
      sleepDate,
      user: { name, email, gender },
    } = validatedData;

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name,
          email,
          gender: gender || "NOT_SPECIFIED",
        },
      });
    }

    const newRecord = await prisma.sleepRecord.create({
      data: {
        sleepDuration,
        sleepDate: parse(sleepDate, "MM/dd/yyyy", new Date()),
        user: { connect: { id: user.id } },
      },
    });

    res.status(201).json(newRecord);
  } catch (error) {
    logger.error(error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ errors: error.errors });
    } else {
      res.status(500).json({ error: "Failed to add sleep record" });
    }
  }
};
