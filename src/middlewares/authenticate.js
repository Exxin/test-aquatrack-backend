import createHttpError from 'http-errors';

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
};
