const queryText = (value) => (typeof value === 'string' ? value.trim() : '');
const searchExpression = (value) => new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

const paginationOptions = (query) => {
  const positiveInteger = (value, fallback) => {
    const number = Number(value);
    return Number.isSafeInteger(number) && number > 0 ? number : fallback;
  };
  const page = positiveInteger(query.page, 1);
  const limit = Math.min(positiveInteger(query.limit, 6), 50);
  return { page, limit, skip: Math.min((page - 1) * limit, Number.MAX_SAFE_INTEGER) };
};

export { paginationOptions, queryText, searchExpression };
