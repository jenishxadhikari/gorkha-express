import express from "express"
import helmet from "helmet";
import cookieParser from "cookie-parser"
import cors from "cors"
import type { Request, Response } from "express"

import { corsOptions } from "./lib/cors.js";
import { reqLogger } from "./middlewares/req.middleware.js";

const app = express()

app.use(helmet())
app.use(cors(corsOptions))
app.use(reqLogger)
app.use(cookieParser())
app.use(express.json())

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Hello from user service."
  })
})

export default app