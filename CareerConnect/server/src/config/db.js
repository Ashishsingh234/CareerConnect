const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');

let gfsBucket = null;

async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI not set in env');
  const conn = await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const db = mongoose.connection.getClient().db();
  gfsBucket = new GridFSBucket(db, { bucketName: 'uploads' });
  console.log('MongoDB connected');
  return conn;
}

function getGfsBucket() {
  if (!gfsBucket) throw new Error('GridFSBucket not initialized');
  return gfsBucket;
}

module.exports = { connectDB, getGfsBucket };
