// src/middlewares/errorHandler.js

import { HttpError } from 'http-errors';
import { MongooseError } from 'mongoose';

export const errorHandler = (err, req, res, next) => {
  if (err instanceof HttpError) {
    return res.status(err.status).json({
      status: err.status,
      message: err.name,
      data: err,
    });
  }

  if (err instanceof MongooseError) {
    return res.status(404).json({
      status: 404,
      message: "NotFoundError",
      data: {
        message: "Entry water not found",
      },
    });
  }

  return res.status(500).json({
    status: 500,
    message: 'Something went wrong',
    error: err.message,
  });
};
