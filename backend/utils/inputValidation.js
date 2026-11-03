const invalidInput = (message) => {
  const error = new Error(message);
  error.status = 400;
  return error;
};

const readText = (input, field, label, required = false) => {
  const value = input?.[field];
  if (value !== undefined && typeof value !== 'string') {
    throw invalidInput(`${label} must be text`);
  }
  const text = value?.trim() || '';
  if (required && !text) throw invalidInput(`${label} is required`);
  return text;
};

const readDate = (input, field, label, required = false) => {
  const text = readText(input, field, label, required);
  if (!text) return null;
  const date = new Date(text);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text) || Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== text) {
    throw invalidInput(`${label} must be a valid date`);
  }
  return date;
};

export { invalidInput, readDate, readText };
