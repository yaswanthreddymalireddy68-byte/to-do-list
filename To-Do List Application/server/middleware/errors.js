export function notFound(_req, res) {
  res.status(404).json({ message: 'The requested resource was not found.' });
}

export function errorHandler(error, _req, res, _next) {
  if (error.code === 11000) return res.status(409).json({ message: 'An account with this email already exists.' });
  if (error.name === 'ValidationError' || error.name === 'CastError') {
    return res.status(400).json({ message: error.message });
  }
  if (error.type === 'entity.too.large') return res.status(413).json({ message: 'Request body is too large.' });
  console.error(error);
  return res.status(error.status || 500).json({ message: error.status ? error.message : 'Something went wrong on the server.' });
}
