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

// Дозволені домени, з яких можна робити запити
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://aquatrack-one.vercel.app',
  'https://test-aquatrack-backend.onrender.com',
];

const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

export const setupServer = () => {
  const app = express();
  const axios = express('axios');

  // Налаштування CORS
  app.use(cors(corsOptions));

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  app.use('/uploads', express.static(UPLOAD_DIR));
  app.use('/api-docs', swaggerDocs());

  app.use(
    pino({
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
        },
      },
    }),
  );

app.get('/auth/google/callback', async (req, res) => {
    const code = req.query.code;
    if (!code) {
        return res.status(400).send('No code provided');
    }

    try {
        const response = await axios.post('https://oauth2.googleapis.com/token', null, {
            params: {
                code: code,
                client_id: 'YOUR_CLIENT_ID',
                client_secret: 'YOUR_CLIENT_SECRET',
                redirect_uri: 'https://aquatrack-one.vercel.app/tracker',
                grant_type: 'authorization_code',
            },
        });

        const { access_token } = response.data;
        // Виклик функції для отримання даних користувача
        await getUserInfo(access_token, res);
    } catch (error) {
        console.error('Error exchanging code for token:', error);
        res.status(500).send('Error');
    }
});

// Функція для отримання даних користувача
const getUserInfo = async (accessToken, res) => {
    try {
        const response = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const userData = response.data;

        // Збереження даних користувача в базу даних
        await saveUserData(userData);

        // Перенаправлення на ваш фронтенд
        res.redirect('https://aquatrack-one.vercel.app/tracker');
    } catch (error) {
        console.error('Error fetching user info:', error);
        res.status(500).send('Error');
    }
};

// Функція для збереження даних користувача
const saveUserData = async (userData) => {
    // Реалізуйте збереження даних користувача в базу даних
    console.log('Saving user data:', userData);
    // Наприклад: await User.create(userData);
};

  app.use(router);

  app.use('*', notFoundHandler);
  app.use(errorHandler);

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
    // Додаємо підтримку preflight запитів
  app.options('*', cors(corsOptions));
};
