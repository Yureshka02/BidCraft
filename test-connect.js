require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

(async () => {
  try {
    console.log('Connecting to:', process.env.MONGODB_URI);
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: 'bid_craft',
      serverApi: { version: '1', strict: true, deprecationErrors: true },
      serverSelectionTimeoutMS: 15000,
    });
    console.log('✅ Connected');
    await mongoose.connection.db.collection('ping').insertOne({ at: new Date() });
    console.log('✅ Inserted doc');
  } catch (e) {
    console.error(e);
  } finally {
    await mongoose.disconnect();
  }
})();
