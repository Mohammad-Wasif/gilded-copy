import multer from "multer";

const storage = multer.memoryStorage();

// Maximum size allowed for any file is 25MB (for videos)
// Type-specific limits will be enforced in the controller.
export const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024, 
  },
  fileFilter: (req, file, cb) => {
    // Only allow images and videos
    if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only images and videos are allowed."));
    }
  }
});
