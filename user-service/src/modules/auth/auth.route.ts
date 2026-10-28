import Router from "express";

import { AuthController } from "./auth.controller.js";

const router = Router();

router.route("/auth/register").post(AuthController.register);
router.route("/auth/verify").post(AuthController.verify);
router.route("/auth/login").post(AuthController.login);
router.route("/auth/refresh").post(AuthController.refresh);

export { router as AuthRouter };
  