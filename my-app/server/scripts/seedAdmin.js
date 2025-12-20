require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const bcrypt = require('bcryptjs');
const connectDB = require('../src/config/db');
const Admin = require('../src/models/Admin');

async function seed() {
  const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in server/.env');
    process.exit(1);
  }

  await connectDB(process.env.MONGODB_URI);

  const adminEmail = ADMIN_EMAIL.toLowerCase();
  const existing = await Admin.findOne({ email: adminEmail });
  if (existing) {
    console.log('Admin already exists. Skipping.');
    process.exit(0);
  }

  const hashed = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await Admin.create({ email: adminEmail, password: hashed });
  console.log(`Admin created for ${ADMIN_EMAIL}`);
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});

