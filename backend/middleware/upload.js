import { randomUUID } from 'crypto';
import { mkdirSync } from 'fs';
import { dirname, extname, resolve } from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';

const currentDirectory = dirname(fileURLToPath(import.meta.url));
const uploadsDirectory = resolve(currentDirectory, '../uploads');

mkdirSync(uploadsDirectory, { recursive: true });

const allowedImageTypes = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
};

const storage = multer.diskStorage({
  destination: uploadsDirectory,
  filename: (_request, file, callback) => {
    const safeExtension = file.mimetype === 'image/png' ? '.png' : '.jpg';
    callback(null, `${randomUUID()}${safeExtension}`);
  },
});

const imageFileFilter = (_request, file, callback) => {
  const fileExtension = extname(file.originalname).toLowerCase();
  const allowedExtensions = allowedImageTypes[file.mimetype];

  if (!allowedExtensions?.includes(fileExtension)) {
    const error = new Error('Only JPG, JPEG, and PNG images are allowed');
    error.status = 400;
    return callback(error);
  }

  return callback(null, true);
};

const upload = multer({ storage, fileFilter: imageFileFilter });

export { uploadsDirectory };
export default upload;
