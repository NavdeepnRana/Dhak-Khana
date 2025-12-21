const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes');
const parcelRoutes = require('./routes/parcelRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const infoRoutes = require('./routes/infoRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const agentRoutes = require('./routes/agentRoutes');
const centerRoutes = require('./routes/centerRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(cookieParser());
  app.use(morgan('dev'));

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/agents', agentRoutes);
  app.use('/api/info', infoRoutes);
  app.use('/api/parcels', parcelRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/feedback', feedbackRoutes);
  app.use('/api/centers', centerRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = createApp;

