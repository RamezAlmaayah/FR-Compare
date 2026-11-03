import useRecord from '../hooks/useRecord';
import formatDate from '../utils/formatDate';

const ItemPriceHistoryHint = ({ itemId }) => {
  const { record: history, loading, error } = useRecord(itemId ? `/items/${itemId}/price-history` : null, 'priceHistory');
  if (!itemId) return null;
  if (loading) return <p className="price-history-hint">Loading previous paid price...</p>;
  if (error) return <p className="price-history-hint" role="alert">{error}</p>;
  if (!history?.purchaseCount) return <p className="price-history-hint">No previous paid price.</p>;
  return <p className="price-history-hint">Last paid price: {history.lastPaidUnitPrice} JD. Supplier: {history.supplierName}. Date: {formatDate(history.quotationDate)}. RFQ: {history.rfqReference}. Reference only.</p>;
};

export default ItemPriceHistoryHint;
