// src/server.js

import express from 'express';
import pino from 'pino-http';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import { env } from './utils/env.js';
import router from './routers/index.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import { UPLOAD_DIR } from './constants/index.js';
import { swaggerDocs } from './middlewares/swaggerDocs.js';

const PORT = Number(env('PORT', '3000'));

//дозволені домени, з яких можна робити запити
// const allowedOrigins = [
//   //локалхост для тестування
//   'http://localhost:5173',
//   'http://localhost:3000',

//   //деплой-продакшен
//   'https://test-aquatrack.vercel.app',
//   'https://test-aquatrack-backend.onrender.com',
// ];

export const setupServer = () => {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://test-aquatrack.vercel.app');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});
  // app.use(cors());
  app.use(cors({
    origin: 'https://test-aquatrack.vercel.app',
    credentials: true,
    preflightContinue: true,
  }));

  app.use(cookieParser());
  app.use('/uploads', express.static(UPLOAD_DIR));
  app.use('/api-docs', swaggerDocs());

  app.use(
    pino({
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true, // приклад опції для кольорового виведення
        },
      },
    }),
  );

  app.use(router);

  app.use('*', notFoundHandler);

  app.use(errorHandler);

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};
