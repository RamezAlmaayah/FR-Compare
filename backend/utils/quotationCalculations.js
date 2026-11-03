import { invalidInput, readText } from './inputValidation.js';

const readNonNegativeNumber = (value, label, fallback) => {
  if (value === undefined || value === '' || (value === null && fallback === null)) {
    if (fallback !== undefined) return fallback;
    throw invalidInput(`${label} is required`);
  }
  if ((typeof value !== 'number' && typeof value !== 'string') || (typeof value === 'string' && !value.trim())) {
    throw invalidInput(`${label} must be a finite number greater than or equal to zero`);
  }
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) {
    throw invalidInput(`${label} must be a finite number greater than or equal to zero`);
  }
  return number;
};

const calculateQuotation = (input, rfqItems) => {
  if (!Array.isArray(input.itemPrices) || input.itemPrices.length !== rfqItems.length) {
    throw invalidInput('Provide exactly one unit price for every RFQ item');
  }
  const submittedRows = new Map();
  for (const row of input.itemPrices) {
    const id = readText(row, 'rfqItemId', 'RFQ item ID', true);
    if (submittedRows.has(id)) throw invalidInput('Duplicate RFQ item price row');
    if (!rfqItems.some((item) => item._id.toString() === id)) throw invalidInput('Unknown RFQ item price row');
    submittedRows.set(id, row);
  }
  const itemPrices = rfqItems.map((item) => {
    const submitted = submittedRows.get(item._id.toString());
    const unitPrice = readNonNegativeNumber(submitted.unitPrice, 'Unit price');
    const lineTotal = item.quantity * unitPrice;
    if (!Number.isFinite(lineTotal)) throw invalidInput('Calculated line total is too large');
    return {
      rfqItemId: item._id,
      itemId: item.itemId,
      itemName: item.itemName,
      quantity: item.quantity,
      unitPrice,
      lineTotal,
      notes: readText(submitted, 'notes', 'Pricing note'),
    };
  });
  const subtotal = itemPrices.reduce((sum, item) => sum + item.lineTotal, 0);
  const additionalCost = readNonNegativeNumber(input.additionalCost, 'Additional cost', 0);
  const discount = readNonNegativeNumber(input.discount, 'Discount', 0);
  const grandTotal = subtotal + additionalCost - discount;
  if (!Number.isFinite(subtotal) || !Number.isFinite(grandTotal)) throw invalidInput('Calculated total is too large');
  if (grandTotal < 0) throw invalidInput('Discount cannot make the grand total negative');
  return { itemPrices, subtotal, additionalCost, discount, grandTotal };
};

export { calculateQuotation, readNonNegativeNumber };
