import multer from "multer";
import path from "path";
import fs from "fs";
import { MAX_FILE_SIZE, UPLOAD_FOLDER } from "../../constants.js";

// Configure temporary disk storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const tempDir = path.join(process.cwd(), UPLOAD_FOLDER);
    fs.mkdirSync(tempDir, { recursive: true }); // Ensure the directory exists
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const filename = path.basename(
      file.originalname,
      path.extname(file.originalname),
    );
    const ext = path.extname(file.originalname);
    cb(null, `${filename}-${timestamp}${ext}`);
  },
});
const fileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Only image files are allowed!"), false);
  }
  cb(null, true);
};

const upload = multer({
  storage: storage,
  limits: { fileSize: MAX_FILE_SIZE * 1024 * 1024 }, // SET IN CONSTANT
  fileFilter: fileFilter,
});

export default upload;
