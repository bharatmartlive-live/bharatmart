import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'backend/uploads');
  },
  filename(req, file, cb) {
    const extension = path.extname(file.originalname);
    const basename = path.basename(file.originalname, extension).replace(/\s+/g, '-').toLowerCase();
    cb(null, `${Date.now()}-${basename}${extension}`);
  }
});

export const upload = multer({ storage });
