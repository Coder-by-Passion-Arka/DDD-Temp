import { Router } from "express";
import { uploadFile, deleteFile } from "../controllers/upload.controller.js";
import { verifyJWT, fileSizeLimit } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.use(verifyJWT);
router.use(fileSizeLimit(100 * 1024 * 1024)); // 100MB limit

router.route("/").post(upload.single("file"), uploadFile);
router.route("/:publicId").delete(deleteFile);

export default router;
