const getApiStatus = (request, response) => {
  response.status(200).json({
    message: 'FR Compare API is running',
  });
};

export { getApiStatus };
