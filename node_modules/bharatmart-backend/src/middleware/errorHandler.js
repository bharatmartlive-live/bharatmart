export function notFound(req, res) {
  res.status(404).json({ message: 'Route not found.' });
}

export function errorHandler(error, req, res, next) {
  console.error(error);

  if (error.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ message: 'This record already exists.' });
  }

  if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT' || error.code === 'ENOTFOUND') {
    return res.status(503).json({ message: 'Database connection failed. Please check MySQL credentials and network access.' });
  }

  const status = error.status || 500;
  res.status(status).json({
    message: status === 500 ? 'Server error. Please try again or contact support.' : error.message,
    stack: process.env.NODE_ENV === 'production' ? undefined : error.stack
  });
}
