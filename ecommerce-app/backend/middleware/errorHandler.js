const errorHandler = (err, req, res, next) => {
  console.error(`[Error] ${req.method} ${req.path}:`, err.message);
 
  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }
 
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Invalid token' });
  }
 
  // Default server error
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
 
const notFound = (req, res) => {
  res.status(404).json({ error: `Route ${req.originalUrl} not found` });
};
 
module.exports = { errorHandler, notFound };
 