const getApiErrorMessage = (error, fallbackMessage) =>
  error.response?.data?.error || fallbackMessage;

export default getApiErrorMessage;
