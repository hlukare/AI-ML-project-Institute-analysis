import multer from "multer";
import path from "path";
import fs from "fs";
import config from "../../config/config.js";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(process.cwd(), "uploads/documents");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const fileName = `${Date.now()}-${file.originalname}`;
    cb(null, fileName);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedFormats = ["pdf", "docx", "doc"];
    if (allowedFormats.includes(file.mimetype.split("/")[1])) {
      cb(null, true);
    } else {
      cb(new Error("File type not allowed"));
    }
  },
  limits: { fileSize: 1024 * 1024 * 5 }, // 5MB
});

export default upload;
