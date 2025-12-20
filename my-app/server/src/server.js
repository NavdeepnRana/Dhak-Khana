require('dotenv').config();
const createApp = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB(process.env.MONGODB_URI);
  const app = createApp();
  app.listen(PORT, () => {
    console.log(`🚀 Server listening on http://localhost:${PORT}`);
  });
}

start();