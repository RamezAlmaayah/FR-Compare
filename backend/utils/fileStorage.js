import { unlink } from 'fs/promises';
import { basename, dirname, resolve } from 'path';
import { uploadsDirectory } from '../middleware/upload.js';

const deleteUploadedFile = async (imagePath) => {
  if (!imagePath) {
    return;
  }

  const filePath = resolve(uploadsDirectory, basename(imagePath));

  if (dirname(filePath) !== uploadsDirectory) {
    return;
  }

  try {
    await unlink(filePath);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
};

export default deleteUploadedFile;
