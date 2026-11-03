const testApi = () => {
  const target = process.env.FR_COMPARE_TEST_API;
  if (!target) return `http://127.0.0.1:${process.env.PORT || 5000}/api`;
  if (process.env.FR_COMPARE_TEST_LIVE !== 'yes' || target !== 'https://frcompare-api.onrender.com/api') {
    throw new Error('Live integration tests require the approved FR Compare API and explicit FR_COMPARE_TEST_LIVE=yes.');
  }
  return target;
};

export default testApi;
