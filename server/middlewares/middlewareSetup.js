// middlewareSetup.js
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const express = require('express');

function setupMiddlewares(app) {
  // CORS configuration
  app.use(cors({
    origin: 'https://deendirectory.onrender.com',
methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
credentials: true,
}));

  // Security-related HTTP headers
  app.use(helmet());

  // GZIP compression
  app.use(compression());

  // Apply rate limiting to all requests
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  });
  app.use(limiter);

  // Parse JSON and url-encoded bodies
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
}

module.exports = setupMiddlewares;