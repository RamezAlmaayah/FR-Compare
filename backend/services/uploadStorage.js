import { mkdir, writeFile, unlink } from 'node:fs/promises';
import { dirname, resolve, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pipeline } from 'node:stream/promises';
import { Readable } from 'node:stream';
import mongoose from 'mongoose';

const uploadsDirectory = resolve(process.env.UPLOAD_DIR || resolve(dirname(fileURLToPath(import.meta.url)), '../uploads'));
const storageMode = () => process.env.UPLOAD_STORAGE || (process.env.NODE_ENV === 'production' ? 'gridfs' : 'local');
const getBucket = () => new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'uploads' });

const storeUploadedFile = async (file, userId) => {
  if (storageMode() === 'gridfs') {
    const stream = getBucket().openUploadStream(file.filename, { metadata: { userId, contentType: file.mimetype } });
    try { await pipeline(Readable.from([file.buffer]), stream); }
    catch (error) { await stream.abort().catch(() => {}); throw error; }
  } else {
    await mkdir(uploadsDirectory, { recursive: true });
    await writeFile(resolve(uploadsDirectory, file.filename), file.buffer, { flag: 'wx' });
  }
};

const deleteUploadedFile = async (imagePath) => {
  if (!imagePath) return;
  const filename = basename(imagePath);
  if (imagePath !== `/uploads/${filename}` || !/^[a-f0-9-]+\.(png|jpe?g)$/i.test(filename)) return;
  if (storageMode() === 'gridfs') {
    const bucket = getBucket();
    const file = await bucket.find({ filename }).next();
    if (file) await bucket.delete(file._id);
  } else {
    try { await unlink(resolve(uploadsDirectory, filename)); }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
};

export { uploadsDirectory, storageMode, getBucket, storeUploadedFile, deleteUploadedFile };
