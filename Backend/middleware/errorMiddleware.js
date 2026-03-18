// Global Error Handling Middleware
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log to console for dev
  console.error(`[Error Middleware Intercept] ${err.name}: ${err.message}`);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = `Resource not found. Invalid: ${err.path}`;
    error = { message, statusCode: 404 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val) => val.message);
    error = { message, statusCode: 400 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = { message, statusCode: 400 };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token. Please log in again.';
    error = { message, statusCode: 401 };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Your token has expired. Please log in again.';
    error = { message, statusCode: 401 };
  }

  // Default to 500 server error
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error',
    // Include stack trace only in development
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = errorHandler;
