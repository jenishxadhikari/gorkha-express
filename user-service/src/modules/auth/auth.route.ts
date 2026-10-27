import Router from "express";

import { AuthController } from "./auth.controller.js";

const router = Router();

router.route("/auth/register").post(AuthController.register);
router.route("/auth/verify").post(AuthController.verify);

export { router as AuthRouter };
