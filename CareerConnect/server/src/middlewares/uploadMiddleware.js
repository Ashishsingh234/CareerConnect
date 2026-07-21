const multer = require('multer');
const stream = require('stream');
const { getGfsBucket } = require('../config/db');

const storage = multer.memoryStorage();
const upload = multer({ storage }); // Multer instance

async function uploadToGridFS(fileBuffer, filename, contentType) {
  const bucket = getGfsBucket();
  const readStream = new stream.Readable();
  readStream.push(fileBuffer);
  readStream.push(null);

  const uploadStream = bucket.openUploadStream(filename, { contentType });
  return new Promise((resolve, reject) => {
    readStream.pipe(uploadStream)
      .on('error', reject)
      .on('finish', (file) => resolve(file));
  });
}

module.exports = { upload, uploadToGridFS }; // Correct exports