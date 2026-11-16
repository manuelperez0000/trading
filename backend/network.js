import "dotenv/config";
import cors from "cors";
import express from "express";
import { fileURLToPath } from "node:url";
import errorManager from "./errorManager.js";
import rootRouter from "./routes/index.js";

const app = express();
const frontendDirectory = fileURLToPath(new URL("../front", import.meta.url));

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use("/api/v1", rootRouter);
app.use(express.static(frontendDirectory));
app.use(errorManager);

export default app;