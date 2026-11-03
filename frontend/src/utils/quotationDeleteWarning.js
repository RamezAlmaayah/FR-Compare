const quotationDeleteWarning = (quotation) => quotation?.status === 'Selected'
  ? 'This is the selected winner. Deleting it will reopen the RFQ and remove its supplier rating and paid-price history.' : '';

export default quotationDeleteWarning;
