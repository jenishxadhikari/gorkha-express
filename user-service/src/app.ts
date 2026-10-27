import express from "express"
import helmet from "helmet";
import cookieParser from "cookie-parser"
import cors from "cors"
import type { Request, Response } from "express"

import { corsOptions } from "./lib/cors.js";
import { reqLogger } from "./middlewares/req.middleware.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { AuthRouter } from "./modules/auth/auth.route.js";

const app = express()

app.use(helmet())
app.use(cors(corsOptions))
app.use(reqLogger)
app.use(cookieParser())
app.use(express.json())

app.use("/api/v1", AuthRouter)

app.get("/api/v1/auth", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Hello from user service."
  })
})

app.use(errorMiddleware)

export default app