const express = require('express');
const logger = require('./utils/logger');
const { sequelize } = require('./db/sequelize');
const servicesRouter = require('./routes/servicesRouter');
const setupMiddlewares = require('./middlewares/middlewareSetup');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.set('trust proxy', 1);

setupMiddlewares(app);

app.use('/api/services', servicesRouter);

app.use(express.static(path.join(__dirname, '../client/dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
});

app.use((error, req, res, next) => {
  logger.error('Unhandled application error:', error);
  res.status(500).json({ message: 'An internal server error occurred.' });
});

sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}).catch((error) => {
  logger.error('Failed to sync database or start server:', error);
});
