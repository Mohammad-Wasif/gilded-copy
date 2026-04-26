import { Router } from "express";
import { uploadMedia } from "./upload.controller";
import { uploadMiddleware } from "../../middleware/upload";
import { requireAdmin } from "../../middleware/requireAdmin";

export const uploadRouter = Router();

// Endpoint for uploading single media file to Cloudinary
// Note: It is restricted to admin explicitly.
uploadRouter.post(
  "/",
  requireAdmin,
  uploadMiddleware.single("media"),
  uploadMedia
);
