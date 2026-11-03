const notFound = (_request, response) => response.status(404).json({ error: 'Route not found' });

const handleError = async (error, request, response, next) => {
  if (response.headersSent) return next(error);
  let status = Number(error.status || error.statusCode || 500);
  if (!Number.isInteger(status) || status < 400 || status > 599) status = 500;
  let message = status >= 500 ? 'Internal server error' : error.message;
  if (error.name === 'ValidationError' || error.name === 'CastError') { status = 400; message = 'Invalid input'; }
  if (error.code === 11000) { status = 409; message = 'A record with these details already exists'; }
  if (error.type === 'entity.parse.failed') { status = 400; message = 'Invalid JSON payload'; }
  if (error.type === 'entity.too.large') { status = 413; message = 'Request is too large'; }
  if (error.name === 'MulterError') {
    status = error.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    message = error.code === 'LIMIT_FILE_SIZE' ? 'Images must be 5 MB or smaller' : 'Invalid upload request';
  }
  if (status >= 500) console.error(JSON.stringify({ event: 'request_failed', requestId: response.get('X-Request-Id'), status }));
  response.status(status).json({ error: message });
};

export { handleError, notFound };
