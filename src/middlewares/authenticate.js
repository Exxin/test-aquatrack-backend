import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';
import { env } from '../utils/env.js';
import { UsersGoogleCollection } from '../db/models/user.js';

// Middleware для перевірки JWT
export const authenticate = async (req, res, next) => {
  const authHeader = req.get('Authorization');

  // Перевірка наявності заголовка Authorization
  if (!authHeader) {
    return next(createHttpError(401, 'Please provide Authorization header'));
  }

  const [bearer, token] = authHeader.split(' ');

  // Перевірка наявності типу Bearer та токену
  if (bearer !== 'Bearer' || !token) {
    return next(createHttpError(401, 'Auth header should be of type Bearer'));
  }

  try {
    // Перевірка та декодування токену
    const decoded = jwt.verify(token, env('JWT_SECRET'));
    const user = await UsersGoogleCollection.findById(decoded.id);

    // Перевірка, чи існує користувач
    if (!user) {
      return next(createHttpError(404, 'User not found'));
    }

    req.userGoogle = user;
    next();
  } catch (error) {
    // Обробка помилок перевірки токену
    next(createHttpError(401, 'Unauthorized'));
  }
};
