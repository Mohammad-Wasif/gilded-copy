import { Request, Response } from "express";
import { cloudinary } from "../../lib/cloudinary";

const IMAGE_SIZE_LIMIT = 5 * 1024 * 1024; // 5 MB
const VIDEO_SIZE_LIMIT = 25 * 1024 * 1024; // 25 MB

export async function uploadMedia(req: Request, res: Response) {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, message: "No file provided" });
    }

    const isVideo = file.mimetype.startsWith("video/");
    const isImage = file.mimetype.startsWith("image/");

    if (isImage && file.size > IMAGE_SIZE_LIMIT) {
      return res.status(400).json({
        success: false,
        message: `Image exceeds the size limit of 5MB. Provided: ${(file.size / 1024 / 1024).toFixed(2)}MB`
      });
    }

    if (isVideo && file.size > VIDEO_SIZE_LIMIT) {
      return res.status(400).json({
        success: false,
        message: `Video exceeds the size limit of 25MB. Provided: ${(file.size / 1024 / 1024).toFixed(2)}MB`
      });
    }

    // Upload using stream to avoid temporary files locally
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "auto", // Automatically detect if it's an image or video
          folder: "gilded-heirloom"
        },
        (error, result) => {
          if (error) {
            return reject(error);
          }
          resolve(result);
        }
      );

      // Pass the buffer into the stream
      uploadStream.end(file.buffer);
    });

    return res.status(200).json({
      success: true,
      message: "File uploaded successfully",
      data: uploadResult
    });

  } catch (error) {
    req.log.error(error, "Error uploading to Cloudinary");
    return res.status(500).json({ success: false, message: "Media upload failed" });
  }
}
