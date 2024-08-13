import dotenv from "dotenv";
dotenv.config();
import "reflect-metadata";
import express, { Application } from "express";
import cors from "cors";

import cookieParser from "cookie-parser";
import morgan from "morgan";
import handleAddSleepRecord from "./routes/handleAddSleepRecord";
import handleGetUsers from "./routes/handleGetUsers";
import handleGetSleepChartData from "./routes/handleGetSleepChartData";

export const app: Application = express();

async function createServer() {
  app.use(morgan("tiny"));
  app.use(cors({
    origin: 'http://localhost:5173'
  }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.post("/api/sleepRecord", handleAddSleepRecord);
  app.get("/api/users", handleGetUsers);
  app.get("/api/users/:user_id/sleepChartData", handleGetSleepChartData);
}

createServer();
