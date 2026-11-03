const notFound = (request, response) => {
  response.status(404).json({ error: 'Route not found' });
};

const handleError = (error, _request, response, _next) => {
  const statusCode =
    error.status || error.statusCode || (response.statusCode >= 400 ? response.statusCode : 500);
  const errorMessage =
    error.type === 'entity.parse.failed' ? 'Invalid JSON payload' : error.message;

  response.status(statusCode).json({
    error: statusCode === 500 ? 'Internal server error' : errorMessage,
  });
};

export { handleError, notFound };
