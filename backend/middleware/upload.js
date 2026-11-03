import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';
import multer from 'multer';
import { storeUploadedFile, uploadsDirectory } from '../services/uploadStorage.js';

const allowedImageTypes = { 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'] };
const invalidImage = () => Object.assign(new Error('Only valid JPG, JPEG, and PNG images are allowed'), { status: 400 });
const parser = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1, fields: 30, fieldSize: 1024 * 1024, parts: 31 },
  fileFilter: (_request, file, callback) => callback(
    allowedImageTypes[file.mimetype]?.includes(extname(file.originalname).toLowerCase()) ? null : invalidImage(), true,
  ),
});

const upload = {
  single: (field) => (request, response, next) => {
    parser.single(field)(request, response, async (error) => {
      if (error) return next(error);
      const file = request.file;
      if (!file) return next();
      const valid = file.mimetype === 'image/png'
        ? file.buffer.subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a', 'hex'))
        : file.buffer.subarray(0, 3).equals(Buffer.from('ffd8ff', 'hex'));
      if (!valid) { request.file = undefined; return next(invalidImage()); }
      file.filename = `${randomUUID()}${file.mimetype === 'image/png' ? '.png' : '.jpg'}`;
      try {
        await storeUploadedFile(file, request.userId);
        delete file.buffer;
        return next();
      } catch (storageError) { request.file = undefined; return next(storageError); }
    });
  },
};

export { uploadsDirectory };
export default upload;
