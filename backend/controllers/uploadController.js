import { pipeline } from 'node:stream/promises';
import Supplier from '../models/Supplier.js';
import Quotation from '../models/Quotation.js';
import { getBucket, storageMode, uploadsDirectory } from '../services/uploadStorage.js';

const getUpload = async (request, response, next) => {
  const filename = request.params.filename;
  if (!/^[a-f0-9-]+\.(png|jpe?g)$/i.test(filename)) return response.status(404).json({ error: 'Image not found' });
  const image = `/uploads/${filename}`;
  const [supplier, quotation] = await Promise.all([
    Supplier.exists({ userId: request.userId, image }), Quotation.exists({ userId: request.userId, image }),
  ]);
  if (!supplier && !quotation) return response.status(404).json({ error: 'Image not found' });
  response.set('Cache-Control', 'private, no-store');
  response.set('Content-Type', filename.endsWith('.png') ? 'image/png' : 'image/jpeg');
  if (storageMode() === 'local') {
    return response.sendFile(filename, { root: uploadsDirectory, dotfiles: 'deny' }, (error) => {
      if (error) next(error.code === 'ENOENT' ? Object.assign(new Error('Image not found'), { status: 404 }) : error);
    });
  }
  const bucket = getBucket();
  const file = await bucket.find({ filename, 'metadata.userId': request.userId }).next();
  if (!file) return response.status(404).json({ error: 'Image not found' });
  await pipeline(bucket.openDownloadStream(file._id), response);
};

export { getUpload };
