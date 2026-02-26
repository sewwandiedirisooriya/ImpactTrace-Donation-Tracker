// middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.stack);

  // SQLite constraint error
  if (err.message.includes('SQLITE_CONSTRAINT')) {
    return res.status(400).json({
      success: false,
      message: 'Database constraint error',
      error: err.message
    });
  }

  // Default error
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? {} : err.message
  });
};

module.exports = errorHandler;