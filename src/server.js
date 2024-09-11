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
  'https://test-aquatrack-backend.onrender.com'
];

const CLIENT_ID = process.env['GOOGLE_AUTH_CLIENT_ID'];
const CLIENT_SECRET = process.env['GOOGLE_AUTH_CLIENT_SECRET'];
const REDIRECT_URI = 'http://localhost:3000/auth/callback';

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

  app.get('/', (req, res) => {
    res.status(200).json({
      message: "Welcome to the Aquatrack API!",
    });
  });

  // Endpoint to start Google OAuth flow
app.get('/auth/google', (req, res) => {
  const redirectUri = `https://accounts.google.com/o/oauth2/auth?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=profile email&access_type=offline`;
  res.redirect(redirectUri);
});

// Endpoint to handle the callback from Google
app.get('/auth/callback', async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).send('Code not found');
  }

  try {
    const response = await axios.post('https://oauth2.googleapis.com/token', null, {
      params: {
        code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
      },
    });

    const { access_token } = response.data;

    // Optionally, you can store the token in a cookie or session
    res.cookie('access_token', access_token);
    res.redirect('/profile');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error during Google OAuth');
  }
});

// Example profile route
app.get('/profile', (req, res) => {
  res.send('Profile page');
});

  app.use(router);

  app.use('*', notFoundHandler);
  app.use(errorHandler);

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
    // Додаємо підтримку preflight запитів
  app.options('*', cors(corsOptions));
};
