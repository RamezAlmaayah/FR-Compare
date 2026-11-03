import mongoose from 'mongoose';

const connectDatabase = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error('MONGO_URI is not configured.');
  }

  await mongoose.connect(mongoUri);
  console.log('MongoDB connected successfully.');
};

export default connectDatabase;
