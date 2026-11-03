const AUTH_TOKEN_KEY = 'token';

const getStoredToken = () => localStorage.getItem(AUTH_TOKEN_KEY);

const storeToken = (token) => {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
};

const removeStoredToken = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
};

export { getStoredToken, removeStoredToken, storeToken };
