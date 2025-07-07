import {Router} from "express";
import healthCheck from "../controllers/healthCheck.controller.js";

// Make a new Router instance
const router = Router();

// Route the healthCheck endpoint to the healthCheck controller
router.route("/").get(healthCheck);

export default router;